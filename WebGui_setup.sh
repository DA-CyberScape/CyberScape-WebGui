#!/bin/bash

cd ~

# Variables
git_repo="https://github.com/DA-CyberScape/CyberScape-WebGui"
project_dir="/var/www/CyberScape-WebGui"

# Update and install dependencies
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git unzip

# Install Node.js and npm
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.4/install.sh | bash
source ~/.bashrc
nvm install node
nvm use node
sudo apt install npm -y

# Install PM2 globally
sudo npm install -g pm2

# Clone or update the project
if [ ! -d "$project_dir" ]; then
    sudo git clone $git_repo $project_dir
else
    cd $project_dir
    sudo git pull origin main
fi

# Change ownership and move to project directory
sudo chown -R $USER:$USER $project_dir
cd $project_dir

# Install dependencies
npm install

# .env file has to be inserted manually
sudo nano .env

# Set up Prisma
npx prisma generate
npx prisma migrate deploy

# Build the project
npm run build
pm2 restart
# Start the application using PM2
pm2 start npm --name "cyberscape-webgui" -- run start

# Set PM2 to start on system boot
pm2 save
pm2 startup

# Create update script
set +H
printf "#!/bin/bash\ncd $project_dir\nsudo git pull origin main\nnpm install\nnpm run build\npm2 restart cyberscape-webgui\necho \"✅ Update completed!\"\n" > $project_dir/update_webgui.sh
chmod +x $project_dir/update_webgui.sh

# Create alias for update script
echo "alias update-webgui='$project_dir/update_webgui.sh'" >> ~/.bashrc
source ~/.bashrc

# Output success message
echo "WebGui setup completed successfully!"
echo "Run pm2 logs cyberscape-webgui to view the logs"
echo "Run update-webgui to update the webgui to the latest version"