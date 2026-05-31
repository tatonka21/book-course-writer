# 📚 AI Book & Course Writer

An AI-powered content creation tool that generates books, courses, magazines, eBooks, and workbooks using **Ollama** running on your own hardware.

## ✨ Features

- **5 Content Types**: Books, Online Courses, Magazines, eBooks, Workbooks
- **Customizable**: Set number of chapters/sections, length per section, writing tone
- **Real-time Generation**: See content appear section by section
- **Progress Tracking**: Visual progress bar shows generation status
- **Export Options**: Copy to clipboard or download as text file
- **Secure**: Your API key stays in your browser - never sent anywhere else
- **Private**: Uses your own Ollama instance via Cloudflare Tunnel

## 🚀 How to Use

### 1. Start Your Ollama Tunnel

On your Termux/Android device:

```bash
# Start Ollama + Auth Proxy + Cloudflare Tunnel
./start-ollama-public.sh
```

This will give you a public URL like: `https://xxxx.trycloudflare.com`

### 2. Open the Web App

Visit: **https://tatonka21.github.io/book-course-writer**

### 3. Configure & Generate

1. Enter your **Ollama API URL** (the trycloudflare.com URL)
2. Enter your **API Key** (shown when you start the tunnel)
3. Select **Content Type** (Book, Course, Magazine, etc.)
4. Enter your **Title/Topic**
5. Set **Number of Sections** and **Length per Section**
6. Write a **Detailed Description** of what you want
7. Choose a **Writing Tone**
8. Click **🚀 Generate Content**

## 🛠 Tech Stack

- **Frontend**: Vanilla HTML, CSS, JavaScript
- **AI Backend**: Ollama (CodeLlama, Llama 2, Mistral, etc.)
- **Tunnel**: Cloudflare Tunnel (trycloudflare.com)
- **Auth Proxy**: Node.js Express with API key authentication
- **Hosting**: GitHub Pages

## 📁 Project Structure

```
book-course-writer/
├── index.html      # Main HTML page
├── style.css       # Styling
├── app.js          # Application logic
└── README.md       # This file

ollama-proxy/
├── server.js       # Auth proxy server
├── .api_key        # Your API key (auto-generated)
└── package.json    # Node.js dependencies

start-ollama-public.sh  # One-command startup script
```

## 🔒 Security

- All API requests go through an **API key authentication proxy**
- Requests without a valid API key are rejected with 401/403
- Your API key is stored locally in `ollama-proxy/.api_key`
- The web app never stores or transmits your key anywhere except to your tunnel

## 📄 License

MIT