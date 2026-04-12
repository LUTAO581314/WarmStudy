"""
VectorStore - 简单向量存储模块
"""
from typing import Dict, List, Any


class VectorStore:
    """简单的内存向量存储"""

    def __init__(self) -> None:
        self.vectors: Dict[str, List[float]] = {}

    def insert_vector(self, vector_id: str, vector: List[float]) -> None:
        self.vectors[vector_id] = vector

    def retrieve_vector(self, vector_id: str) -> List[float]:
        return self.vectors[vector_id]

    def delete_vector(self, vector_id: str) -> bool:
        if vector_id in self.vectors:
            del self.vectors[vector_id]
            return True
        return False

    def list_ids(self) -> List[str]:
        return list(self.vectors.keys())
