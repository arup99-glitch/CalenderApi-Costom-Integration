/* exported gapiLoaded */
/* exported gisLoaded */
/* exported handleAuthClick */
/* exported handleSignoutClick */

// TODO(developer): Set to client ID and API key from the Developer Console
const CLIENT_ID = '15175251518-vgld926qmlj23cacebp09sf24d60ule8.apps.googleusercontent.com';
const API_KEY = 'AIzaSyBiGPcjEvP0MBmMezqiVLfUGW933MGrQqg';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES = 'https://www.googleapis.com/auth/calendar';

let tokenClient;
let gapiInited = false;
let gisInited = false;

document.getElementById('authorize_button').style.visibility = 'hidden';
document.getElementById('signout_button').style.visibility = 'hidden';

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
  gapi.load('client', initializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function initializeGapiClient() {
  await gapi.client.init({
    apiKey: API_KEY,
    discoveryDocs: [DISCOVERY_DOC],
  });
  gapiInited = true;
  maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: CLIENT_ID,
    scope: SCOPES,
    callback: '', // defined later
  });
  gisInited = true;
  maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
  if (gapiInited && gisInited) {
    document.getElementById('authorize_button').style.visibility = 'visible';
  }
}

/**
 * Sign in the user upon button click.
 */
function handleAuthClick() {
  tokenClient.callback = async (resp) => {
    if (resp.error !== undefined) {
      throw (resp);
    }
    document.getElementById('signout_button').style.visibility = 'visible';
    document.getElementById('authorize_button').innerText = 'Refresh';

    // Show the event creation form and event list after successful authorization
    document.getElementById('event-form').style.display = 'block';
    document.getElementById('events').style.display = 'block';

    await listEvents(); // List events after authorization
  };

  if (gapi.client.getToken() === null) {
    // Prompt the user to select a Google Account and ask for consent to share their data
    // when establishing a new session.
    tokenClient.requestAccessToken({prompt: 'consent'});
  } else {
    // Skip display of account chooser and consent dialog for an existing session.
    tokenClient.requestAccessToken({prompt: ''});
  }
}

/**
 * Sign out the user upon button click.
 */
function handleSignoutClick() {
  const token = gapi.client.getToken();
  if (token !== null) {
    google.accounts.oauth2.revoke(token.access_token);
    gapi.client.setToken('');
    document.getElementById('content').innerText = '';
    document.getElementById('authorize_button').innerText = 'Authorize';
    document.getElementById('signout_button').style.visibility = 'hidden';

    // Hide the event creation form and event list when the user signs out
    document.getElementById('event-form').style.display = 'none';
    document.getElementById('events').style.display = 'none';
  }
}

// Create an event
// Create an event
function createCalendarEvent() {
  // Get values from the input fields
  const eventTitle = document.getElementById("event-title").value;
  const eventDescription = document.getElementById("event-description").value;
  const startDateTime = new Date(document.getElementById("start-datetime").value).toISOString();
  const endDateTime = new Date(document.getElementById("end-datetime").value).toISOString();

  // Check if all required fields are filled
  if (!eventTitle || !startDateTime || !endDateTime) {
    alert("Please fill in all required fields.");
    return;
  }

  // Create the event object
  const event = {
    'summary': eventTitle,
    'description': eventDescription,
    'start': {
      'dateTime': startDateTime,
      'timeZone': 'America/Los_Angeles' // Adjust to your time zone
    },
    'end': {
      'dateTime': endDateTime,
      'timeZone': 'America/Los_Angeles'
    }
  };

  // Insert event into Google Calendar
  gapi.client.calendar.events.insert({
    'calendarId': 'primary',
    'resource': event
  }).then(response => {
    alert("Event created: " + response.result.htmlLink);
    document.getElementById("create-event-form").reset()
     // Show success message
     const successMessage = document.getElementById('success-message');
     successMessage.style.display = 'block';
     successMessage.innerHTML = 'Event Created Successfully!';
 
     // Hide success message after 3 seconds
     setTimeout(() => {
       successMessage.style.display = 'none';
     }, 3000);
    listEvents(); // Refresh the event list
  }).catch(error => {
    console.error("Error creating event: ", error);
  });
}




// List upcoming events
function listEvents() {
  gapi.client.calendar.events.list({
    'calendarId': 'primary',
    'timeMin': (new Date()).toISOString(),
    'showDeleted': false,
    'singleEvents': true,
    'maxResults': 10,
    'orderBy': 'startTime'
  }).then(response => {
    const events = response.result.items;
    const eventList = document.getElementById("event-list");
    eventList.innerHTML = ''; // Clear current list
    events.forEach(event => {
      const li = document.createElement("li");
      li.textContent = `${event.summary} (${event.start.dateTime || event.start.date})`;
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.onclick = () => deleteEvent(event.id);
      li.appendChild(deleteButton);
      eventList.appendChild(li);
    });
  }).catch(error => {
    console.error("Error listing events: ", error);
  });
}

// Delete an event
function deleteEvent(eventId) {
  gapi.client.calendar.events.delete({
    'calendarId': 'primary',
    'eventId': eventId
  }).then(() => {
    alert("Event deleted");
    listEvents();
  }).catch(error => {
    console.error("Error deleting event: ", error);
  });
}
