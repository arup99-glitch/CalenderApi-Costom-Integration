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
   *  Sign in the user upon button click.
   */
  function handleAuthClick() {
    tokenClient.callback = async (resp) => {
      if (resp.error !== undefined) {
        throw (resp);
      }
      document.getElementById('signout_button').style.visibility = 'visible';
      document.getElementById('authorize_button').innerText = 'Refresh';
      await listUpcomingEvents();
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
   *  Sign out the user upon button click.
   */
  function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
      google.accounts.oauth2.revoke(token.access_token);
      gapi.client.setToken('');
      document.getElementById('content').innerText = '';
      document.getElementById('authorize_button').innerText = 'Authorize';
      document.getElementById('signout_button').style.visibility = 'hidden';
    }
  }

 

/// Add an event to Google Calendar and refresh the events list immediately
const addEvent = () => {
    const title = document.getElementById("title").value;
    const desc = document.getElementById("desc").value;
    const date = document.getElementById("date").value;
    const start = document.getElementById("st").value;
    const end = document.getElementById("et").value;
  
    const startTime = new Date(date + "," + start).toISOString();
    const endTime = new Date(date + "," + end).toISOString();
  
    var event = {
      summary: title,
      location: "Google Meet",
      description: desc,
      start: {
        dateTime: startTime,
        timeZone: "America/Los_Angeles"
      },
      end: {
        dateTime: endTime,
        timeZone: "America/Los_Angeles"
      },
      recurrence: ["RRULE:FREQ=DAILY;COUNT=2"],
      attendees: [
        { email: "abc@google.com" },
        { email: "xyz@google.com" }
      ],
      reminders: {
        useDefault: false,
        overrides: [
          { method: "email", minutes: 24 * 60 },
          { method: "popup", minutes: 10 }
        ]
      }
    };
  
    // Insert the event and refresh the event list upon success
    gapi.client.calendar.events.insert({
      calendarId: "primary",
      resource: event
    }).execute(function(event) {
      console.log('Event created:', event.htmlLink);
  
      // Clear form fields
      document.getElementById("title").value = '';
      document.getElementById("desc").value = '';
      document.getElementById("date").value = '';
      document.getElementById("st").value = '';
      document.getElementById("et").value = '';
  
      // Refresh the event list to show the newly added event
      listUpcomingEvents();
    });
  };

  /**
   * Print the summary and start datetime/date of the next ten events in
   * the authorized user's calendar. If no events are found an
   * appropriate message is printed.
   */


  async function listUpcomingEvents() {
    let response;
    try {
      const request = {
        'calendarId': 'primary',
        'timeMin': (new Date()).toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 10,
        'orderBy': 'startTime',
      };
      response = await gapi.client.calendar.events.list(request);
    } catch (err) {
      document.getElementById('content').innerText = err.message;
      return;
    }
  
    const events = response.result.items;
    if (!events || events.length == 0) {
      document.getElementById('content').innerText = 'No events found.';
      return;
    }
  
    // Clear previous content
    document.getElementById('content').innerHTML = 'Events:\n';
  
    // Display each event with a delete button
    events.forEach(event => {
      const eventElement = document.createElement('div');
      eventElement.textContent = `${event.summary} (${event.start.dateTime || event.start.date})`;
  
      const deleteButton = document.createElement('button');
      deleteButton.innerText = 'Delete';
      deleteButton.onclick = () => deleteEvent(event.id); // Assign delete function
      eventElement.appendChild(deleteButton);
  
      document.getElementById('content').appendChild(eventElement);
    });
  }
  
  /**
   * Delete an event from Google Calendar.
   * @param {string} eventId The ID of the event to delete.
   */
  async function deleteEvent(eventId) {
    try {
      const request = gapi.client.calendar.events.delete({
        'calendarId': 'primary',
        'eventId': eventId
      });
      await request.execute(() => {
        alert('Event deleted successfully!');
        listUpcomingEvents(); // Refresh the list after deletion
      });
    } catch (err) {
      console.error('Error deleting event:', err);
    }
  }


