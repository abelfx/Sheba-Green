
# 📘 Trash Detection API – Flutter Integration Guide

This document explains how to integrate the **`/predict`** and **`/verify`** endpoints from the FastAPI backend into your Flutter app.

The backend detects trash in images and provides prompts for user verification.

---

## 🌍 Base URL

```
http://<your-server-ip>:8000
```

---

## 🔍 1. `/predict` – Detect Trash in Image

### **Description**

Upload an image of trash to detect objects (plastic, glass, metal, etc.).
Optionally request a **dynamic verification prompt**.

### **HTTP Request**

```
POST /predict
```

### **Request Body**

* **Multipart Form Data**

  * `file` *(required)*: The trash image (JPEG, PNG).
  * `use_dynamic_prompt` *(optional, bool, default: false)*: Whether to generate a dynamic prompt.

### **Flutter Example**

```dart
import 'package:http/http.dart' as http;

Future<void> predictTrash(String filePath) async {
  var uri = Uri.parse("http://<your-server-ip>:8000/predict");

  var request = http.MultipartRequest("POST", uri)
    ..files.add(await http.MultipartFile.fromPath("file", filePath))
    ..fields["use_dynamic_prompt"] = "true"; // optional

  var response = await request.send();
  var responseBody = await response.stream.bytesToString();

  print("Predict response: $responseBody");
}
```

### **Example Response**

```json
{
  "detection_result": {
    "detected": true,
    "boxes": [
      {
        "x1": 25,
        "y1": 49.35,
        "x2": 75,
        "y2": 115.14,
        "confidence": 0.8,
        "class_id": 0,
        "class_name": "plastic"
      }
    ],
    "count": 1,
    "image_path": null
  },
  "random_prompt": {
    "prompt": "Hold up 1 finger next to the glass container",
    "trash_type": "plastic",
    "action_required": "photo_verification"
  },
  "processing_time": 2.46,
  "image_dimensions": {
    "width": 500,
    "height": 329
  }
}
```

---

## ✅ 2. `/verify` – Verify Trash + User Prompt

### **Description**

After getting a prompt from `/predict`, upload a new image that **satisfies the prompt** (e.g., hold up fingers, gestures).
The backend will verify if the action matches the prompt.

### **HTTP Request**

```
POST /verify
```

### **Request Body**

* **Multipart Form Data**

  * `file` *(required)*: The new verification image.
  * `prompt` *(required, string)*: The prompt received from `/predict`.

### **Flutter Example**

```dart
import 'package:http/http.dart' as http;

Future<void> verifyTrash(String filePath, String prompt) async {
  var uri = Uri.parse("http://<your-server-ip>:8000/verify");

  var request = http.MultipartRequest("POST", uri)
    ..files.add(await http.MultipartFile.fromPath("file", filePath))
    ..fields["prompt"] = prompt;

  var response = await request.send();
  var responseBody = await response.stream.bytesToString();

  print("Verify response: $responseBody");
}
```

### **Example Response**

```json
{
  "verified": false,
  "reason": "The image shows trash but no fingers or hand gesture.",
  "detection_result": {
    "detected": true,
    "boxes": [
      {
        "x1": 25,
        "y1": 50.1,
        "x2": 175,
        "y2": 150.3,
        "confidence": 0.8,
        "class_id": 0,
        "class_name": "plastic"
      }
    ],
    "count": 1,
    "image_path": null
  },
  "processing_time": 15.18,
  "image_dimensions": {
    "width": 500,
    "height": 334
  }
}
```

---

## 📌 Notes for Flutter Integration

* Always use `http.MultipartRequest` for image upload.
* Responses are in JSON → you can parse with `dart:convert`:

  ```dart
  import 'dart:convert';

  var data = jsonDecode(responseBody);
  print(data["detection_result"]["detected"]);
  ```
* Maximum file size and allowed extensions are enforced by the backend.
* Use `/classes` to fetch supported trash categories.
* Use `/random-prompt` if you need prompts without detection.

---

✅ With these two APIs, you can build a **trash detection + user verification flow** in Flutter.

