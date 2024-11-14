# Google Calendar Integration Web App

This project is a web application that integrates with the Google Calendar API to allow users to authenticate with their Google account, view upcoming events, and create new events directly from the app.

## Features

- **User Authentication** with Google.
- **Display Upcoming Events** from the user’s Google Calendar.
- **Create New Events** with details like title, start time, and end time.

## Technologies

- JavaScript
- HTML & CSS
- Google Calendar API
- OAuth 2.0 for Google authentication

## Setup Instructions

### Prerequisites

- A [Google Cloud Platform](https://console.cloud.google.com/) (GCP) project with Calendar API enabled.
- A Google API Client ID and API Key.

### Steps to Run

1. **Create a GCP Project and Enable Calendar API**
   - Go to [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project (or select an existing one).
   - Enable the **Google Calendar API** for the project.
   - Create **OAuth 2.0 credentials** for Web application access.
   - Obtain the **Client ID** and **API Key**.

2. **Clone the Repository**

   ```bash
   git clone https://github.com/your-username/your-repo-name.git
   cd your-repo-name
