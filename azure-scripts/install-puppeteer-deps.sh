apt-get update && apt-get install -y wget gnupg ca-certificates procps libxss1

# Install Puppeteer dependencies
apt-get install -y \
    libasound2 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils

# Install additional dependencies for running Chromium in a headless environment
apt-get install -y \
    libgbm1 \
    libpangocairo-1.0-0 \
    libxshmfence1

# Clean up the apt cache to reduce image size
apt-get clean
rm -rf /var/lib/apt/lists/*

# Install puppeteer so it's available in the node_modules folder
# Adjust puppeteer version as needed
#npm install puppeteer