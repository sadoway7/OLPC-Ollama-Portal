# L2 Massage Support - Unraid Deployment Guide

This document provides instructions on how to deploy the L2 Massage Support application in Unraid using the Unraid Docker UI.

## Prerequisites

-   An Unraid server with Docker support enabled.
-   The application files for L2 Massage Support.

## Deployment Steps

1.  **Prepare the Application Files:**
    -   Ensure all application files (e.g., `package.json`, `index.html`, `src` directory) are located in a directory on your Unraid server. For example, `/mnt/user/appdata/l2-massage-support`.

2.  **Open the Unraid Docker UI:**
    -   Navigate to the "Docker" tab in your Unraid web interface.

3.  **Add a New Container:**
    -   Click on the "Add Container" button.

4.  **Configure the Container:**
    -   **Name:** Enter a name for your container, such as `l2-massage-support`.
    -   **Repository:** Leave this field blank.
    -   **Image:** Enter `node:18` as the image. This will use the official Node.js image.
    -   **Network Type:** Select `bridge`.
    -   **Port Mappings:**
        -   Click "Add another Path, Port or Variable".
        -   **Container Port:** Enter `5173`.
        -   **Host Port:** Enter a port that is not in use on your Unraid server, such as `8080`.
        -   **Protocol:** Select `tcp`.
    -   **Path Mappings:**
        -   Click "Add another Path, Port or Variable".
        -   **Container Path:** Enter `/app`.
        -   **Host Path:** Enter the path to your application files on your Unraid server, e.g., `/mnt/user/appdata/l2-massage-support`.
        -   **Access Mode:** Select `Read/Write`.
    -   **Extra Parameters:**
        -   Click "Add another Path, Port or Variable".
        -   **Variable:** Enter `NODE_ENV`.
        -   **Value:** Enter `production`.
    -   **Post Arguments:**
        -   Enter `npm run build && npm run preview -- --host 0.0.0.0`

5.  **Apply and Start the Container:**
    -   Click "Apply" to save the container configuration.
    -   Click "Start" to start the container.

6.  **Access the Application:**
    -   Open a web browser and navigate to `http://<your-unraid-ip>:<host-port>`. For example, `http://192.168.1.100:8080`.

## Notes

-   Ensure that the host port you choose is not already in use by another service on your Unraid server.
-   The application will be served from the specified host port.
-   The `NODE_ENV=production` environment variable ensures that the application runs in production mode.
-   The `npm run build && npm run preview -- --host 0.0.0.0` command builds the application and starts a preview server that is accessible from the network.

## Troubleshooting

-   If the application does not start, check the container logs for any errors.
-   Ensure that the path mappings are correct and that the application files are accessible by the container.
-   If you encounter issues with the application, refer to the application's documentation or contact the application's support team.
