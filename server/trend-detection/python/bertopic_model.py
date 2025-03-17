import sys
import json
import numpy as np
from bertopic import BERTopic
from sklearn.feature_extraction.text import CountVectorizer
from sentence_transformers import SentenceTransformer

def process_data(options):
    """Process content data and extract topics using BERTopic"""
    try:
        # Parse options
        input_file = options.get('inputFile')
        output_file = options.get('outputFile')
        num_topics = options.get('numTopics', 10)
        min_cluster_size = options.get('minClusterSize', 5)
        
        # Load input data
        with open(input_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Extract text and IDs
        texts = [item['text'] for item in data]
        doc_ids = [item['id'] for item in data]
        
        if len(texts) < min_cluster_size:
            # Not enough data for clustering
            result = {
                'topics': [],
                'topicDetails': {},
                'docIdToTopic': {},
                'error': f"Not enough data ({len(texts)} items) for clustering. Min required: {min_cluster_size}."
            }
        else:
            # Initialize sentence transformer model for embeddings
            embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            
            # Initialize BERTopic with parameters
            vectorizer = CountVectorizer(stop_words="english")
            topic_model = BERTopic(
                embedding_model=embedding_model,
                vectorizer_model=vectorizer,
                nr_topics=num_topics,
                min_topic_size=min_cluster_size,
                verbose=True
            )
            
            # Fit the model
            topics, probs = topic_model.fit_transform(texts)
            
            # Get topic info and format results
            topic_info = topic_model.get_topic_info()
            topic_words = {str(topic_id): topic_model.get_topic(topic_id) for topic_id in set(topics) if topic_id != -1}
            
            # Format topic details
            topic_details = {}
            doc_id_to_topic = {}
            
            # Map document IDs to topics
            for i, (doc_id, topic_id) in enumerate(zip(doc_ids, topics)):
                doc_id_to_topic[doc_id] = int(topic_id)
                
                # Skip outlier topic (-1)
                if topic_id == -1:
                    continue
                
                topic_str = str(topic_id)
                if topic_str not in topic_details:
                    # Get representative words for this topic
                    words = topic_words.get(topic_str, [])
                    word_objects = [{"word": word, "weight": weight} for word, weight in words]
                    
                    # Get a name for the topic (first 3 words)
                    topic_name = " ".join([w[0] for w in words[:3]]) if words else f"Topic {topic_id}"
                    
                    topic_details[topic_str] = {
                        "name": topic_name,
                        "words": word_objects,
                        "docs": [doc_id],
                        "count": 1
                    }
                else:
                    # Add document to existing topic
                    topic_details[topic_str]["docs"].append(doc_id)
                    topic_details[topic_str]["count"] += 1
            
            result = {
                'topics': topics.tolist() if isinstance(topics, np.ndarray) else topics,
                'topicDetails': topic_details,
                'docIdToTopic': doc_id_to_topic
            }
        
        # Write output to file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
            
        # Print success message (will be captured by Node.js)
        print(f"Successfully processed {len(texts)} documents into topics")
        
    except Exception as e:
        # Handle errors and write to output file
        error_result = {
            'error': str(e),
            'topics': [],
            'topicDetails': {},
            'docIdToTopic': {}
        }
        
        if 'output_file' in locals():
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(error_result, f)
        
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    # Read options from command line
    if len(sys.argv) != 2:
        print("Usage: python bertopic_model.py <options_json>")
        sys.exit(1)
    
    options = json.loads(sys.argv[1])
    process_data(options)