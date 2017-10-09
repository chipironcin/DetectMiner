# DetectMiner
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=flat)]()

A simple **but clever** browser extension for Google Chrome that tells you if the current page is using your computer to mine cryptocurrencies.

## Motivation
Some Javascript mining utilities for the browser have appeared recently in the internet (for example in Github).

It was about time someone with huge traffic started to use them.

After ThePirateBay¹ and Showtime² started mining from user's browser without further notice to the visitors I decided to build an extension to detect these practices so any non-technical user can detect if a page is mining on their behalf.

  * ⁽¹⁾ https://torrentfreak.com/the-pirate-bay-website-runs-a-cryptocurrency-miner-170916/
  * ⁽²⁾ https://www.theregister.co.uk/2017/09/25/showtime_hit_with_coinmining_script/

## Features
- [x] Open source list of filters
- [x] Discerns three levels (no mining, may be mining, is mining for sure)
- [x] Detects suspicious WebSockets connections
- [x] Detects suspicious Javascript files in the page
- [x] Detects suspicious Javascript files load dynamically
- [x] Detects suspicious Javascript objects and functions
- [x] Saves state between tabs
- [x] Updates on tab reload
- [x] Beautiful, simple and at-a-glance information
- [x] Lightweight

## Installation

### Consumer
~~You can go and get right now the extension in the Chrome Extension Store~~ **(In progress)**

### Developer
If you want to try it locally for development purposes:

  - Clone the repo
  - Go to `chrome://extensions/`
  - Enable developer mode
  - Load unpacked extension...

### Check if it works
Just enter [CoinHive website](https://coinhive.com) and you will see the extension reacting. Start mining to see how the extension detects it.

## How is it different from others?
  * It does not get in between your requests and the server (does not block **any** outgoing request
  * It does not only detect suspicious outgoing connections but also suspicious loaded Javascript, even if the source URL is a custom one that is not in the filters

This means this extension will not slowdown your connection by inspecting the requests.

This also means that if a malicious site decides to host the miner script on their own (and even changing the name of the loaded Javascript file) and it contains suspicious objects or functions, it will also be flagged.

## Why only detect and not block?
This extension has been written with the intention of allowing non-tech users to know when a page is mining cryptocurrencies on their side. It is meant to be lightweight and non-intrusive.

Some sites did a POC of replacing old intrusive ads by a mining script to generate income from visits. Some of them even throttled users CPU to be fair and not consume all possible CPU. They did without notifying the user, that's why this extension was conceived.

Mining scripts (if done correctly) should be understood as an **option to intrusive and fake ads**. Everyone is free of blocking ads and mining scripts, but cutting the possible sources of income for a popular website may end up in its closing. Blocking intrusive ads may be fair to improve your experience in the web. But **giving a bit of CPU during your visit to a webpage in exchange for content** won't affect your navigation experience and will give site admins a new source of income to **maintain the website you are enjoying**.

## Technical quirks
- Requires Chrome version 58 to support wss connections
- Stores in-memory data
  - Not using chrome.storage API because calls are async
  - Not using webStorage because async functions may try to edit value at the same time (read/write race condition)
- Background is a persistent page and not an event page because with even pages it is not possible to intercept web requests
- Usage of intermediate content script to help injecting a detection script in the page context (so it can read Javascript object and functions) and to help communicating data from the injected script to the background page

## Todo
- [ ] Draw a diagram of how it works to help with future development
- [ ] Check and make it work with iframes
- [ ] Better handle errors (mostly with data types and expected objects)
- [ ] Strong type all the objects and data types shared between scripts
- [ ] Find TODOs in the code

## Roadmap
- [ ] Inspect process CPU (currently in Chrome Dev, wait for chrome.processes API to reach stable channel)
- [ ] Check all opened tabs form the popup

## Contributing to DetectMiner

Contributing to DetectMiner is as easy as peeking the repo. Everyone can contribute with any level of skills. Read the contributing guidelines to start.

## License

The code is available under the MIT license.
