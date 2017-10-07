---
title:  "Setting up a data backup system at home"
date:   2017-10-07
categories: [raspberry-pi]
tags: [raspberry-pi]
---

Data is more and more important, and grouping and backing up your personal data such as important documents and photos can be daunting and time consuming.

> It is the most important task you most likely don't do.

I find it easy to backup my data online on the fly: for example most of my documents (paperwork type) are in a Google Drive folder automaticcaly synced from my laptop(s) to my Drive account (using the Google Backup and Sync software), and my photos are all automatically backed up on Google Photos, as I take them from my phone. The first thing I do after coming back from travelling is to upload my non-connected camera's (DLSR and GoPro) photos to my Google Photos account.

This is a good solution, as long a you trust the online storage providers involved. But who knows how it will be in a few years, in a decade, in a few decades... And what if you lose your access to your account somehow (a hack or simply by forgetting)?

In this article I describe how to have a small cheap machine (Raspberry Pi) constantly running at home, backing up the content of your different online storage accounts such as Google Photos and Google Drive, Dropbox, etc. into a single hard drive, safely stored at home.

It is cheap both because of the Raspberry Pi is inexpensive (you can even use an older model), and you won't even notice its electricity consumption on your home bill.

The process involves installing an open source software called `rclone` on your Raspberry Pi, in charge of periodically copying your data from your various accounts online, into an external hard drive.

## Install rclone on the Raspberry Pi

`rclone` is an open source software that replicates the infamous `rsync` unix command, but allows you to easily use online storage accounts such as Dropbox and Google Drive as remote servers.

`rclone` has a quite a few binary distributions available, including a Linux 32bit ARM compatible with the Raspberry Pi 3.

Install it by SSHing into your Pi and executing the following commands from :

```
curl -O https://downloads.rclone.org/rclone-v1.38-linux-arm.zip
unzip rclone-v1.38-linux-arm.zip 
rm rclone-v1.38-linux-arm.zip 
cd rclone-v1.38-linux-arm/
sudo cp rclone /usr/bin/
sudo chown root:root /usr/bin/rclone 
sudo chmod 755 /usr/bin/rclone 
sudo mkdir -p /usr/local/share/man/man1
sudo cp rclone.1 /usr/local/share/man/man1/
sudo mandb 
```

Note: These steps can be made into a Docker image for easily running rclone on any other Raspberry Pi.

## Create a SSH tunnel during rclone config 

Run `rclone config` and pick `n` to register a new remote storage account and choose a name for it. In my example, I register my Google Drive account calling it `drive_bastien`.

When registering a remote storage into rclone, you will need to authenticate to that storage account most likely.
This is the case for Google Drive for example, with which you need to authenticate to your Google account in order 
to authorize your rclone setup to access and modify your drive.
`rclone config` makes this authentication super easy, by temporarily creating a local webserver, 
asking you to open your browser at `http://127.0.0.1:53682/auth` and authenticate to your Google account there.
However most likely you will be setting up rclone on a headless server where you cannot do that.
My solution is to create a SSH tunnel from your local machine to your headless server, forwarding the server's port 53682
to a port on your machine.

In order to open the temporary browser window for authenticating with Google Drive account on your Raspberry Pi:

```
ssh -nNT -L 9001:127.0.0.1:53682 pi@raspberrypi.local
```

(the `-nNT` flags makes the command not create a tty session and open any shell)

On your machine (not the Raspberry Pi), open your browser at `http://localhost:9001/auth`, and sign in to your Google Account.
Once the authentication succeeded, you will have to manually change the domain in the URL in your browser back to `http://localhost:9001` to complete the setup.

Kill the tunnel once the config is completed.

## Try to sync a folder from remote into a local folder

That's it, you can now easily copy and synchronise any folders and files. 
Try running `rclone lsd drive_bastien:` and see the list of top level folders listed.
For my setup, I test backing up one particular folder called "Papers" from my Google Drive into a folder called "backup" on the Raspberry Pi:

```
rclone copy drive_bastien:Papers/ ./backup/Papers
```

and notice that all the folders and files under Papers have copied locally, preserving the file timestamps and meta-data etc.

## Create a CRON job to run every day to backup the data you want from your Google Drive

```
crontab -e
```

I recommend explicitely adding one line per folder you want, with appropriate schedule:
```
0 0 * * * rsync copy drive_bastien:Google\ Photos /backup/Photos
0 0 * * * rsync copy drive_bastien:Papers /backup/Papers
```

---
