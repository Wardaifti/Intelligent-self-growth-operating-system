import chromadb
from chromadb.utils import embedding_functions
import os

# Initialize ChromaDB client — stores data locally
chroma_client = chromadb.PersistentClient(path="./chroma_db")

# Use sentence transformers for embeddings — free, no API needed
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

# Get or create collection for journal entries
journal_collection = chroma_client.get_or_create_collection(
    name="journal_entries",
    embedding_function=embedding_fn
)


def store_journal_entry(entry_id: int, user_id: int, text: str):
    """Store a journal entry as an embedding in ChromaDB."""
    try:
        journal_collection.add(
            documents=[text],
            metadatas=[{"user_id": str(user_id), "entry_id": str(entry_id)}],
            ids=[f"entry_{entry_id}"]
        )
    except Exception as e:
        print(f"Error storing embedding: {e}")


def search_similar_entries(user_id: int, query: str, n_results: int = 3) -> list:
    """Search for similar past entries by meaning."""
    try:
        results = journal_collection.query(
            query_texts=[query],
            n_results=n_results,
            where={"user_id": str(user_id)}
        )

        if results and results["documents"] and results["documents"][0]:
            return results["documents"][0]
        return []
    except Exception as e:
        print(f"Error searching embeddings: {e}")
        return []