(function () {
    // window.onload = function() {

    // Functions
    function getQueryString() {
        const scriptElements = document.getElementsByTagName("script");
        const currentScript = Array.from(scriptElements).find((script) =>
            script.src.includes("bubble.js")
        );

        if (currentScript) {
            const queryString = currentScript.src.split("?")[1];
            return queryString;
        }

        return null;
    }

    function getUrlParams(queryString) {
        if (!queryString) {
            return;
        }

        const urlParams = {};
        const params = queryString.split("&");

        for (let i = 0; i < params.length; i++) {
            const param = params[i].split("=");
            const paramName = decodeURIComponent(param[0]);
            const paramValue = decodeURIComponent(param[1] || "");

            urlParams[paramName] = paramValue;
        }

        return urlParams;
    }

    function hideElements() {
        let prevElms = [];
        let numIterations = 0;
        let intervalId = null;

        const checkSelectors = () => {
            const elms = document.querySelectorAll(HUMAN_CHAT_SELECTORS);

            if (
                prevElms.length &&
                prevElms.length === elms.length &&
                Array.from(prevElms).every((elm, index) => elm === elms[index])
            ) {
                numIterations++;
            } else {
                elms.forEach((elm) => {
                    elm.style.display = "none";
                    elm.style.cssText += ";display:none !important;";
                });

                numIterations = 0;
                prevElms = elms;
            }

            if (numIterations >= 3) {
                clearInterval(intervalId);
            }

            return elms;
        };

        const waitForDOMLoaded = () => {
            if (document.readyState === "complete") {
                clearInterval(intervalId);
                intervalId = setInterval(() => checkSelectors(), 1000);
            }
        };

        const observer = new MutationObserver((mutations) => checkSelectors());

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        intervalId = setInterval(waitForDOMLoaded, 1000);

        // First run, to avoid the 1000ms wait
        checkSelectors();
    }

    function showElements() {
        const elms = document.querySelectorAll(HUMAN_CHAT_SELECTORS);

        elms.forEach((elm) => {
            elm.style.cssText += ";display:block !important;";
            elm.style.display = "block";
        });
    }

    // Execution
    const querystring = getQueryString();
    const urlParams = getUrlParams(querystring);
    const API_URL = window.API_URL ? window.API_URL : "http://3.11.9.37";

    const WIDGET_ID = window.ICG_WIDGET_ID
        ? window.ICG_WIDGET_ID
        : urlParams && urlParams.widget_id
        ? urlParams.widget_id
        : null;
    // Intercom, Tidio, Crisp, Kustomer, HelpCrunch, Olark, HubSpot, LiveChat, ClickDesk, Drift, Tawk, LiveAgent, Trengo
    const HUMAN_CHAT_SELECTORS = [
        "#intercom-container",
        "#tidio-chat",
        ".crisp-client",
        "#kustomer-ui-sdk-iframe",
        '[name="helpcrunch-iframe"]',
        "#olark-wrapper",
        "#hubspot-messages-iframe-container",
        "#chat-widget-container",
        "#clickdesk_container",
        "#drift-frame-controller",
        ".widget-visible",
        ".ContactUs",
        "#trengo-web-widget",
    ];

    // Hide all chats
    hideElements();
    fetch(API_URL + "/api/getbubble/" + WIDGET_ID)
        .then((response) => response.json())
        .then(async (response) => {
            if (response && response.status === 404) {
                throw new Error("Widget not found");
                return;
            }
            console.log(response);
            const embedUrl = response && response.data.embed_url;
            const settings = response && response.data;
            const bubble = settings && settings.bubble;
            const notifications = bubble && bubble.data;
            let isOpen = bubble && bubble.pageload;
            const existingViewport = document.querySelector(
                'meta[name="viewport"]'
            );
            if (existingViewport) {
                existingViewport.remove();
            }

            const metaTag = document.createElement("meta");
            metaTag.name = "viewport";
            metaTag.content =
                "width=device-width, height=device-height, initial-scale=1.0, maximum-scale=1.0";
            document.head.appendChild(metaTag);

            const style = document.createElement("style");
            style.innerHTML = `
        .chat-bubble {
          position: fixed;
          bottom: 40px;
          right: ${bubble.position.label === "Right" ? `40px` : "initial"};
          left: ${bubble.position.label === "Left" ? `40px` : "initial"};
          z-index: 9876543210;
        }

        .offset {
          right: ${
              bubble.position.label === "Right" ? `100px` : "initial"
          } !important;
          left: ${
              bubble.position.label === "Left" ? `100px` : "initial"
          } !important;
        }

        .chat-status {
          position: absolute;
          width: 8px;
          height: 8px;
          top: 3px;
          right: ${bubble.position.label === "Right" ? "initial" : "3px"};
          left: ${bubble.position.label === "Left" ? "initial" : "3px"};
          border-radius: 50%;
          background-color: #4ECE3D;
          border: 1px solid #fff;
          box-shadow: 0 0 3px rgba(0,0,0,0.3);
          cursor: pointer;
          z-index: 9876543210;
        }

        .chat-notifications {
          position: fixed;
          bottom: 115px;
          right: ${bubble.position.label === "Right" ? "25px" : "initial"};
          left: ${bubble.position.label === "Left" ? "25px" : "initial"};
          max-width: 360px;
          display: block;
          z-index: 9876543210;
        }

        .chat-notification {
          background-color: white;
          color: black;
          box-shadow: rgba(150, 150, 150, 0.2) 0px 10px 30px 0px, rgba(150, 150, 150, 0.2) 0px 0px 0px 1px;
          border-radius: 10px;
          padding: 20px;
          margin: 8px;
          font-family: sans-serif;
          font-size: 16px;
          cursor: pointer;
          opacity: 1;
          transform: scale(1);
          transition: opacity 0.5s ease 0s, transform 0.5s ease 0s;
        }

        .chat-button:hover, .chat-notification:hover, .chat-status:hover, .chat-action:hover {
          transform: scale(1.1);
          transition: transform .15s ease-in-out;
        }

        .chat-status:hover {
          transform: scale(1.1);
          transition: transform .15s ease-in-out;
        }

        .chat-button {
          background-color: ${bubble.color} !important;
          font-size: 16px !important;
          border: none;
          outline: none;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          width: 60px;
          height: 60px;
          display: block;
          border-radius: 100% !important;
          box-shadow: 0 4px 10px 0 rgba(0,0,0,.05);
          transition: all 0.2s ease !important;
        }

        .chat-button .icon {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 24px;
          line-height: 1;
          transition: all 0.2s ease;
        }

        .chat-button .icon-open {
          background-image: url(https://cdn-icons-png.flaticon.com/512/72/72439.png);
          width: 25px;
          height: 25px;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }

        .chat-button .icon-close {
          background-image: url(https://cdn-icons-png.flaticon.com/512/2976/2976286.png);
          width: 25px;
          height: 25px;
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }

        .chat-window {
          position: absolute;
          right: ${bubble.position.label === "Right" ? "0" : "initial"};
          left: ${bubble.position.label === "Left" ? "0" : "initial"};
          width: 400px;
          height: 600px;
          bottom: 20px;
          margin-bottom: 35px;
          border: 1px solid #ddd;
          opacity: 0;
          pointer-events: none;
          background: #fff;
          overflow: hidden;
          border-radius: 12px;
          box-shadow: 0 6px 6px 0 rgba(0, 0, 0, 0.02), 0 8px 24px 0 rgba(0, 0, 0, 0.12);
          transition: all 0.2s ease;
          animation-duration: 0.3s;
          animation-fill-mode: forwards;
          animation-name: slide-up;
          animation-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
          z-index: 9876543210;
        }

        .chat-window .close-button {
          position: absolute;
          right: 6px;
          top: 6px;
          font-size: 21px;
          color: #1D1D1D;
          background: none;
          outline: none;
          line-height: 1px;
          width: 16px;
          height: 16px;
          border: 1.5px solid #fff;
          border-radius: 50%;
          background-color: #fff;
          box-shadow: 0 0 3px rgba(0,0,0,0.3);
          cursor: pointer;
          padding: 1.25px 0px 0px 0px;
          z-index: 9876543210;
        }

        .chat-window.open {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(-20px);
        }

        .chat-window.close {
          opacity: 0;
          pointer-events: none;
          transform: translateY(0);
          animation-name: slide-down;
        }

        .chat-window iframe {
          width: 100% !important;
          height: 100% !important;
          border: none !important;
        }

        .chat-actions {
          position: absolute;
          bottom: 60%;
          right: 0;
          left: initial;
          width: 400px;
          margin: 10px 0;
          transition: all 0.2s ease;
          animation-duration: 0.3s;
          animation-fill-mode: forwards;
          animation-name: slide-up;
          animation-timing-function: cubic-bezier(0.165, 0.84, 0.44, 1);
        }

        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(-20px);
            opacity: 1;
          }
        }

        @keyframes slide-down {
          from {
            transform: translateY(-20px);
            opacity: 1;
          }
          to {
            transform: translateY(100%);
            opacity: 0;
          }
        }

        @media only screen and (min-width: 1200px) {
          .chat-window {
            height: 600px !important;
          }
        }

        @media only screen and (min-width: 768px) and (max-width: 1199px) {
          .chat-window {
            height: 55vh !important;
          }
        }

        @media only screen and (max-width: 767px) {
          .chat-window {
            position: fixed!important;
            width: 100%!important;
            height: 100%!important;
            top: 20px!important;
            bottom: 0!important;
            right: 0!important;
            left: 0!important;
            border-radius: 0!important;
            box-shadow: none!important;
            transition: none!important;
            z-index: 9876543210!important;
          }

          > iframe {
            height: 100% !important;
          }
        }
        `;
            document.head.appendChild(style);

            // Create the chat bubble container
            const chatBubble = document.createElement("div");
            chatBubble.className = "chat-bubble";

            // Create the chat button
            const chatButton = document.createElement("button");
            chatButton.className = "chat-button";
            chatBubble.appendChild(chatButton);

            // Create the open and close icons
            const iconOpen = document.createElement("span");
            iconOpen.className = "icon icon-open";
            chatButton.appendChild(iconOpen);

            const iconClose = document.createElement("span");
            iconClose.className = "icon icon-close";
            iconClose.style.display = "none";
            chatButton.appendChild(iconClose);

            // Create the chat window
            const chatWindow = document.createElement("div");
            chatWindow.style.display = "none";
            chatWindow.className = "chat-window";
            chatBubble.appendChild(chatWindow);

            // Create the close button for the chat window
            const closeButton = document.createElement("button");
            closeButton.className = "close-button";
            closeButton.innerHTML = "&times;";
            chatWindow.appendChild(closeButton);

            // Create the iframe inside the chat window
            const iframe = document.createElement("iframe");
            iframe.src = embedUrl + WIDGET_ID;
            iframe.style.border = "0";
            iframe.style.overflow = "hidden";
            iframe.style.height = "725px";
            iframe.style.width = "100%";
            chatWindow.appendChild(iframe);

            // Create chat actions container
            const chatActions = document.createElement("div");
            chatActions.style.display = "none";
            chatActions.className = "chat-actions";
            chatBubble.appendChild(chatActions);

            // Create notifications container
            const chatNotifications = document.createElement("div");
            chatNotifications.className = "chat-notifications";

            // Create notification
            if (notifications) {
                for (let i = 0; Object.keys(notifications).length > i; i++) {
                    const notification = document.createElement("div");
                    notification.className = "chat-notification";
                    notification.innerText = notifications[i];
                    chatNotifications.appendChild(notification);
                }
            }

            // Functions
            const open = function () {
                hideElements();

                chatBubble.classList.remove("offset");

                chatNotifications.style.display = "none";
                chatWindow.style.display = "block";

                chatWindow.classList.remove("close");
                chatWindow.classList.add("open");

                iconOpen.style.display = "none";
                iconClose.style.display = "block";

                isOpen = true;
            };

            const close = function () {
                chatNotifications.style.display = "block";
                chatWindow.style.display = "none";

                chatWindow.classList.remove("open");
                chatWindow.classList.add("close");

                iconOpen.style.display = "block";
                iconClose.style.display = "none";

                isOpen = false;
            };

            // Add events
            chatNotifications.addEventListener("click", () => open());
            closeButton.addEventListener("click", () => close());
            chatButton.addEventListener("click", () =>
                !isOpen ? open() : close()
            );
            // Append to the body
            document.body.appendChild(chatNotifications);
            document.body.appendChild(chatBubble);

            // Auto open on first load
            if (!isOpen) {
                setTimeout(() => {
                    open();
                }, 2000);
            }
        });
    // }
})();
