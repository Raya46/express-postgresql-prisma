import cv2
import numpy as np
import pytesseract
import requests 
from flask import Flask, request, jsonify

app = Flask(__name__)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
def preprocess_image(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray,(5,5),0)
    _,thresh = cv2.threshold(gray, 150,255,cv2.THRESH_BINARY_INV)
    return thresh
def extract_text(image):
    custom_config = r'--oem 3 --psm 6'
    text = pytesseract.image_to_string(image, config=custom_config)
    return text
def approve_payment(text):
    if "berhasil" in text.lower():
        return True
    return False

@app.route("/verify", methods=['POST'])
def verify_file():
    if "file"  not in request.files:
        return jsonify({'error':'no file part'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error':'no selected file'}), 400
    
    image_bytes = file.read()
    image = cv2.imdecode(np.frombuffer(image_bytes, np.uint8), cv2.IMREAD_COLOR)

    processed_image = preprocess_image(image)
    extracted_text = extract_text(processed_image)
    print('teks :', extracted_text)
    is_approved = approve_payment(extracted_text)

    if is_approved:
        return jsonify({'approved': is_approved, 'extracted_text': extracted_text})
    
if __name__ == '__main__':
    app.run(debug=True)


