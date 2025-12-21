"""
Document Parser Service

Uses PyPDF2 for text extraction from PDF documents.
Extracts raw text only, ignoring tables and images.
"""

import io
from PyPDF2 import PdfReader


def extract_text_from_pdf(file_content: bytes) -> str:
    """
    Extract raw text from a PDF document using PyPDF2.
    
    This function extracts all text content from each page of the PDF,
    ignoring tables and images. Suitable for vision documents.
    
    Args:
        file_content: The PDF file content as bytes.
        
    Returns:
        The extracted text as a single string with pages separated by newlines.
        
    Raises:
        ValueError: If the PDF cannot be read or is empty.
    """
    try:
        pdf_file = io.BytesIO(file_content)
        reader = PdfReader(pdf_file)
        
        if len(reader.pages) == 0:
            raise ValueError("PDF document is empty")
        
        text_parts = []
        for page_num, page in enumerate(reader.pages, start=1):
            page_text = page.extract_text()
            if page_text:
                text_parts.append(f"--- Page {page_num} ---\n{page_text}")
        
        if not text_parts:
            raise ValueError("No text could be extracted from the PDF")
        
        return "\n\n".join(text_parts)
        
    except Exception as e:
        if "empty" in str(e).lower() or "No text" in str(e):
            raise
        raise ValueError(f"Failed to extract text from PDF: {str(e)}")


def get_pdf_metadata(file_content: bytes) -> dict:
    """
    Extract metadata from a PDF document.
    
    Args:
        file_content: The PDF file content as bytes.
        
    Returns:
        A dictionary containing PDF metadata.
    """
    try:
        pdf_file = io.BytesIO(file_content)
        reader = PdfReader(pdf_file)
        
        metadata = reader.metadata or {}
        
        return {
            "page_count": len(reader.pages),
            "title": metadata.get("/Title", ""),
            "author": metadata.get("/Author", ""),
            "subject": metadata.get("/Subject", ""),
            "creator": metadata.get("/Creator", ""),
        }
    except Exception as e:
        return {"error": str(e)}
