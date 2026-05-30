import os

# Try to import ChromaDB — if it fails, memory is disabled
try:
    import chromadb
    from chromadb.utils import embedding_functions

    chroma_client = chromadb.PersistentClient(path="./chroma_db")
    embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
        model_name="all-MiniLM-L6-v2"
    )
    journal_collection = chroma_client.get_or_create_collection(
        name="journal_entries",
        embedding_function=embedding_fn
    )
    MEMORY_ENABLED = True
    print("✅ ChromaDB memory enabled")

except Exception as e:
    MEMORY_ENABLED = False
    print(f"⚠️ ChromaDB not available — memory disabled: {e}")


def store_journal_entry(entry_id: int, user_id: int, text: str):
    if not MEMORY_ENABLED:
        return
    try:
        journal_collection.add(
            documents=[text],
            metadatas=[{"user_id": str(user_id), "entry_id": str(entry_id)}],
            ids=[f"entry_{entry_id}"]
        )
    except Exception as e:
        print(f"Error storing embedding: {e}")


def search_similar_entries(user_id: int, query: str, n_results: int = 3) -> list:
    if not MEMORY_ENABLED:
        return []
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