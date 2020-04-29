---
title:  "Work in progress: Experimenting with DSP on Raspberry Pi"
date:   2016-09-12
categories: [general]
tags: [general]
---
In this article I describe how I got started experimenting with *Digital Sound Processing (DSP)* on Raspberry Pi.

My first objective was to configure the Pi the play and record audio to and from my USB sound card. You can read how to set this up [in my previous article]({% post_url 2016-09-16-raspberrypi-usb-sound %}).

The initial project I want to achieve is creating a guitar tuner; it would consist of:

 - the Raspberry Pi listening to audio input as stream (coming from the USB sound card)
 - taking samples of 1 or 2 seconds
 - approximating the pitch of the string played (implementing my own pitch detection algorithm)
 - determining what is the closest expected note and how far from that note the current pitch is
 - and using two 8-segments led displays (wired to the Pi's GPIOs) to give a visual indication of the target note (A, B, C#, etc.) and of how to get there (up or down)

I start with experimenting with [Python Sounddevice library](http://python-sounddevice.readthedocs.io/) which allows to play and record audio represented as Numpy arrays. This library binds with the PortAudio library. I choose python-sounddevice because I am comfortable dealing with Numpy and the scipy stack in general. Moreover, I know whatever pitch detection algorithm I implement, it will have to be fast, and pure python would likely be too slow.

First let's install PortAudio on the Pi. It requires Alsa (which of course is already installed on Debian Jessie) but also its developer library:

``` shell
sudo apt-get install libasound-dev libportaudio2
```

Also CFFI (C Foreign Function Interface for Python) needs to be installed, you can get it via `pip` nut you need to install `libffi` first:

``` shell
sudo apt-get install libffi-dev
pip install cffi
```

We can finally install sounddevice:

``` shell
pip install sounddevice
```

Now we can test recording and playing some audio in our python3 interpreter:

``` python
>>> import sounddevice as sd
>>> sd.query_devices()
  0 Sound Blaster E1: USB Audio (hw:0,0), ALSA (1 in, 2 out)
  1 bcm2835 ALSA: - (hw:1,0), ALSA (0 in, 2 out)
  2 bcm2835 ALSA: IEC958/HDMI (hw:1,1), ALSA (0 in, 2 out)
  3 sysdefault, ALSA (128 in, 128 out)
  4 front, ALSA (0 in, 2 out)
  5 surround40, ALSA (0 in, 2 out)
  6 iec958, ALSA (0 in, 2 out)
  7 spdif, ALSA (1 in, 2 out)
  8 dmix, ALSA (0 in, 2 out)
* 9 default, ALSA (128 in, 128 out)

>>> device = 0    # we use my USB sound card device
>>> duration = 5  # seconds
>>> fs = 44100    # samples by second
>>> myrecording = sd.rec(duration * fs, samplerate=fs, channels=2, device=device)
>>> myrecording.shape
(220500, 2)

```
We have recorded 5 seconds of audio from the default input device (my sound blaster card, listed as device 0) at a sample rate of 44100 Hz, on 2 channels. To simplify things in the future, I will always use one single channel, since I don't care about stereo input for pitch detection. 

---
