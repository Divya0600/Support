import pandas as pd
import numpy as np
from openai import AzureOpenAI
import os
import json
import time
from tqdm import tqdm
from sklearn.metrics.pairwise import cosine_similarity

class AITicketResolver:
    """
    AI-powered ticket resolution system that uses a two-stage approach:
    1. Efficient vector embedding search to find similar tickets
    2. Azure OpenAI to understand and generate accurate resolutions
    """
    
    def __init__(self, api_key, endpoint, embedding_deployment="text-embedding-ada-002", completion_deployment="gpt-4o"):
        """Initialize the AI ticket resolver with Azure OpenAI credentials."""
        self.api_key = api_key
        self.endpoint = endpoint
        self.embedding_deployment = embedding_deployment
        self.completion_deployment = completion_deployment
        self.historical_data = None
        self.embeddings = None
        self.column_mapping = None
        
        # Initialize Azure OpenAI client
        self.client = AzureOpenAI(
            api_key=api_key,
            api_version="2023-05-15",
            azure_endpoint=endpoint
        )
        
        print(f"Initialized AI Ticket Resolver with {completion_deployment}")
    
    def load_data(self, file_path, issue_col=None, resolution_col=None):
        """
        Load historical ticket data and detect columns.
        
        Args:
            file_path: Path to CSV or Excel file
            issue_col: Column name for issue descriptions (auto-detected if None)
            resolution_col: Column name for resolutions (auto-detected if None)
        """
        # Load the data
        if file_path.endswith('.csv'):
            self.historical_data = pd.read_csv(file_path)
        elif file_path.endswith(('.xlsx', '.xls')):
            self.historical_data = pd.read_excel(file_path)
        else:
            raise ValueError("Unsupported file format. Use CSV or Excel.")
        
        # Auto-detect columns if not provided
        self.column_mapping = self._detect_columns(issue_col, resolution_col)
        
        # Clean the data
        self._clean_data()
        
        print(f"Loaded {len(self.historical_data)} records from {os.path.basename(file_path)}")
        print(f"Using '{self.column_mapping['issue']}' for issues and '{self.column_mapping['resolution']}' for resolutions")
        
        return self
    
    def _detect_columns(self, issue_col=None, resolution_col=None):
        """Auto-detect issue and resolution columns if not specified."""
        columns = self.historical_data.columns
        mapping = {}
        
        # For issue column
        if issue_col and issue_col in columns:
            mapping['issue'] = issue_col
        else:
            # Try to detect based on common naming patterns
            issue_candidates = [
                col for col in columns if any(term in col.lower() for term in 
                ['issue', 'problem', 'description', 'ticket', 'question', 'query', 'case'])
            ]
            
            if issue_candidates:
                mapping['issue'] = issue_candidates[0]
            else:
                # Use the column with the longest text on average
                text_lengths = {col: self.historical_data[col].astype(str).str.len().mean() 
                               for col in columns if self.historical_data[col].dtype == 'object'}
                if text_lengths:
                    mapping['issue'] = max(text_lengths, key=text_lengths.get)
                else:
                    raise ValueError("Could not detect issue description column")
        
        # For resolution column
        if resolution_col and resolution_col in columns:
            mapping['resolution'] = resolution_col
        else:
            # Try to detect based on common naming patterns
            resolution_candidates = [
                col for col in columns if any(term in col.lower() for term in 
                ['resolution', 'solution', 'answer', 'fix', 'response', 'action'])
            ]
            
            if resolution_candidates:
                mapping['resolution'] = resolution_candidates[0]
            else:
                # Use remaining text columns excluding the issue column
                remaining_text_cols = [col for col in columns 
                                      if col != mapping.get('issue') 
                                      and self.historical_data[col].dtype == 'object']
                
                if remaining_text_cols:
                    # Use the one with the longest average text
                    text_lengths = {col: self.historical_data[col].astype(str).str.len().mean() 
                                  for col in remaining_text_cols}
                    mapping['resolution'] = max(text_lengths, key=text_lengths.get)
                else:
                    raise ValueError("Could not detect resolution column")
        
        return mapping
    
    def _clean_data(self):
        """Clean and preprocess the data."""
        # Ensure columns contain string data
        issue_col = self.column_mapping['issue']
        resolution_col = self.column_mapping['resolution']
        
        self.historical_data[issue_col] = self.historical_data[issue_col].astype(str)
        self.historical_data[resolution_col] = self.historical_data[resolution_col].astype(str)
        
        # Remove rows with empty issues or resolutions
        self.historical_data = self.historical_data[
            (self.historical_data[issue_col].str.strip() != '') & 
            (self.historical_data[resolution_col].str.strip() != '')
        ]
        
        # Remove duplicates based on issue descriptions
        self.historical_data.drop_duplicates(subset=[issue_col], inplace=True)
        
        print(f"After cleaning: {len(self.historical_data)} valid records remain")
    
    def generate_embeddings(self, batch_size=100, max_retries=3, retry_delay=1):
        """
        Generate embeddings for historical tickets using Azure OpenAI.
        Uses batching to handle large datasets efficiently.
        
        Args:
            batch_size: Number of texts to process in each batch
            max_retries: Maximum number of retry attempts for API calls
            retry_delay: Delay between retries in seconds
        """
        if self.historical_data is None:
            raise ValueError("No historical data loaded. Call load_data first.")
        
        issue_col = self.column_mapping['issue']
        issues = self.historical_data[issue_col].tolist()
        total_issues = len(issues)
        
        print(f"Generating embeddings for {total_issues} historical tickets...")
        
        # Initialize embeddings list
        all_embeddings = []
        
        # Process in batches
        for i in range(0, total_issues, batch_size):
            batch = issues[i:i+batch_size]
            batch_size = len(batch)
            
            retry_count = 0
            success = False
            
            while not success and retry_count < max_retries:
                try:
                    # Request embeddings for the batch - updated to use deployment name
                    response = self.client.embeddings.create(
                        input=batch,
                        model=self.embedding_deployment
                    )
                    
                    # Extract embeddings from response
                    batch_embeddings = [item.embedding for item in response.data]
                    all_embeddings.extend(batch_embeddings)
                    
                    success = True
                    print(f"Processed batch {i//batch_size + 1}/{(total_issues + batch_size - 1)//batch_size}")
                    
                except Exception as e:
                    retry_count += 1
                    if retry_count < max_retries:
                        print(f"Error generating embeddings (attempt {retry_count}/{max_retries}): {e}")
                        print(f"Retrying in {retry_delay} seconds...")
                        time.sleep(retry_delay)
                    else:
                        print(f"Failed to generate embeddings after {max_retries} attempts: {e}")
                        raise
        
        # Store embeddings
        self.embeddings = np.array(all_embeddings)
        print(f"Generated {len(all_embeddings)} embeddings, shape: {self.embeddings.shape}")
        
        return self
    
    def get_embedding(self, text):
        """Generate an embedding for a single text."""
        try:
            response = self.client.embeddings.create(
                input=[text],
                model=self.embedding_deployment
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"Error generating embedding: {e}")
            raise
    
    def save_embeddings(self, file_path):
        """Save embeddings to a file for future use."""
        if self.embeddings is None:
            raise ValueError("No embeddings to save. Call generate_embeddings first.")
        
        np.save(file_path, self.embeddings)
        print(f"Saved embeddings to {file_path}")
    
    def load_embeddings(self, file_path):
        """Load embeddings from a file."""
        self.embeddings = np.load(file_path)
        print(f"Loaded embeddings from {file_path}, shape: {self.embeddings.shape}")
        return self
    
    def find_similar_tickets(self, new_ticket, top_n=5, threshold=0.7):
        """
        Find similar historical tickets using vector similarity.
        
        Args:
            new_ticket: Description of the new ticket
            top_n: Number of similar tickets to return
            threshold: Minimum similarity score (0-1)
            
        Returns:
            DataFrame of similar tickets with similarity scores
        """
        if self.embeddings is None:
            raise ValueError("No embeddings available. Call generate_embeddings or load_embeddings first.")
        
        # Generate embedding for the new ticket
        new_embedding = self.get_embedding(new_ticket)
        
        # Calculate similarities with all historical tickets
        similarities = cosine_similarity(
            [new_embedding],
            self.embeddings
        )[0]
        
        # Filter by threshold
        valid_indices = np.where(similarities >= threshold)[0]
        
        if len(valid_indices) == 0:
            # Fallback: use top 3 regardless of threshold if no good matches
            top_indices = np.argsort(similarities)[-min(3, len(similarities)):][::-1]
        else:
            # Get indices of top N similar tickets
            top_indices = valid_indices[np.argsort(similarities[valid_indices])[-min(top_n, len(valid_indices)):]][::-1]
        
        # Create a DataFrame with similar tickets and their similarity scores
        similar_tickets = self.historical_data.iloc[top_indices].copy()
        similar_tickets['similarity_score'] = similarities[top_indices]
        
        return similar_tickets
    
    def get_resolution(self, new_ticket, top_n=3, include_examples=True):
        """
        Get AI-generated resolution for a new ticket.
        
        Args:
            new_ticket: Description of the new ticket
            top_n: Number of similar tickets to consider
            include_examples: Whether to include similar examples in the output
            
        Returns:
            Dictionary with resolution information
        """
        # Find similar tickets
        similar_tickets = self.find_similar_tickets(new_ticket, top_n=top_n)
        
        if len(similar_tickets) == 0:
            return {
                "resolution": "No similar historical tickets found. This may require manual investigation.",
                "confidence": "low",
                "similar_tickets": []
            }
        
        # Prepare information for the AI prompt
        issue_col = self.column_mapping['issue']
        resolution_col = self.column_mapping['resolution']
        
        # Create context with examples for the AI
        context = "Here are some similar historical tickets and their resolutions:\n\n"
        
        examples = []
        for i, (_, ticket) in enumerate(similar_tickets.iterrows(), 1):
            example = {
                "issue": ticket[issue_col],
                "resolution": ticket[resolution_col],
                "similarity": float(ticket['similarity_score'])
            }
            examples.append(example)
            
            context += f"Example {i} (Similarity: {ticket['similarity_score']:.2f}):\n"
            context += f"Issue: {ticket[issue_col]}\n"
            context += f"Resolution: {ticket[resolution_col]}\n\n"
        
        # Build the prompt for the AI
        prompt = (
            f"{context}\n"
            f"New Ticket: {new_ticket}\n\n"
            f"Based on these similar historical tickets, provide a comprehensive resolution for the new ticket. "
            f"Focus on accuracy and relevance. If the similar tickets don't seem relevant enough, "
            f"indicate that this might need a different approach."
        )
        
        # Get resolution from Azure OpenAI - updated to use deployment name
        try:
            response = self.client.chat.completions.create(
                model=self.completion_deployment,
                messages=[
                    {"role": "system", "content": "You are an expert support agent that provides accurate and helpful resolutions to tickets based on historical examples."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            resolution = response.choices[0].message.content
            
            # Calculate confidence based on similarity scores
            best_similarity = similar_tickets.iloc[0]['similarity_score'] if len(similar_tickets) > 0 else 0
            confidence = "high" if best_similarity >= 0.85 else "medium" if best_similarity >= 0.75 else "low"
            
            result = {
                "resolution": resolution,
                "confidence": confidence,
                "similar_tickets": examples if include_examples else []
            }
            
            return result
            
        except Exception as e:
            print(f"Error generating resolution: {e}")
            return {
                "resolution": f"Error generating resolution: {str(e)}. Using the most similar historical resolution instead: {similar_tickets.iloc[0][resolution_col]}",
                "confidence": "low",
                "similar_tickets": examples if include_examples else []
            }


# Example usage
if __name__ == "__main__":
    # Updated configuration with actual values
    api_key = "DwYaOaza4jGnkFWIJADCeaxTunJc5pJa4QNBorvMEagvGxnKr74SJQQJ99BAACYeBjFXJ3w3AAABACOG2XsE"
    endpoint = "https://speechtotext.openai.azure.com/"
    embedding_deployment = "text-embedding-ada-002"
    completion_deployment = "gpt-4o"
    
    # Initialize the system with correct deployment names
    resolver = AITicketResolver(
        api_key=api_key, 
        endpoint=endpoint,
        embedding_deployment=embedding_deployment,
        completion_deployment=completion_deployment
    )
    
    # Create a sample dataset
    if not os.path.exists("sample_tickets.csv"):
        sample_data = {
            'issue_description': [
                "Outlook crashes when opening emails with attachments",
                "Cannot connect to the VPN from home network",
                "Computer runs very slow after recent Windows update",
                "Printer not responding when trying to print documents",
                "Unable to access shared network drive",
                "Forgot password and cannot reset through self-service portal",
                "Blue screen error after logging in",
                "Monitor displays flickering image intermittently",
                "Cannot install software due to admin rights restrictions",
                "Email attachments not downloading in Outlook web version"
            ],
            'solution': [
                "Update Outlook to the latest version and clear the attachment cache by navigating to %temp% and deleting temporary Outlook files.",
                "Ensure you're using the correct VPN client version and reset your home router. If issues persist, contact your ISP to check if they're blocking VPN traffic.",
                "Roll back the problematic Windows update through Control Panel > Programs > View installed updates. Then run Disk Cleanup and defragment the drive.",
                "Restart the print spooler service by going to Services, finding Print Spooler, right-clicking and selecting Restart. Then reinstall the printer driver.",
                "Check if the network is down by pinging the server. Verify network credentials and update them if necessary. Reconnect the network drive using the proper mapping.",
                "Verified identity through secondary authentication method and reset password. Provided temporary password and instructed user to change it upon first login.",
                "Performed system diagnostics that identified faulty RAM. Removed and reseated RAM modules which resolved the issue. Scheduled full hardware diagnostic scan.",
                "Updated graphics driver to latest version. If issue persists, checked and replaced monitor cable. Finally, tested with another monitor to isolate the issue.",
                "Submitted temporary admin rights request for software installation. Assisted with installation and verified software functionality.",
                "Cleared browser cache and cookies. Switched from Edge to Chrome browser as a workaround. Filed bug report with Microsoft for the Outlook Web App team."
            ]
        }
        pd.DataFrame(sample_data).to_csv("sample_tickets.csv", index=False)
        print("Created sample tickets file for testing")
    
    # Load data and generate embeddings
    resolver.load_data("sample_tickets.csv")
    resolver.generate_embeddings()
    
    # Test with a new ticket
    new_ticket = "My Outlook keeps crashing whenever I try to open emails with PDF attachments"
    
    # Get resolution
    result = resolver.get_resolution(new_ticket)
    
    print(f"\nNew Ticket: {new_ticket}")
    print(f"\nResolution (Confidence: {result['confidence'].upper()}):")
    print("-" * 80)
    print(result['resolution'])
    print("-" * 80)