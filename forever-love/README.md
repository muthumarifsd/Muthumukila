# Forever & Always

A responsive, cinematic anniversary surprise for Mukila & Marimuthu. Built with HTML5, CSS3 and vanilla JavaScript; no framework, build step or paid service is required.

## Run with VS Code Live Server

1. Open the `forever-love` folder in Visual Studio Code.
2. Install the **Live Server** extension by Ritwick Dey if it is not already installed.
3. Open `index.html` and select **Go Live** in the status bar (or right-click the file and choose **Open with Live Server**).
4. Sign in with either name, `Mukila` or `Marimuthu`, and the password `31-10-2022`.

You can also open `index.html` directly in a modern browser, though Live Server gives the most reliable local experience. The sign-in is a front-end demonstration, not real authentication. Access is remembered only in the current browser tab session using `sessionStorage`.

## Replace the photo placeholders

The six local illustrations live in `assets/images/` as `moment-01.svg` through `moment-06.svg`. Replace each SVG with your own image file (JPG, PNG, or WebP), then update the corresponding `src` in `love.html`. For example, change `assets/images/moment-01.svg` to `assets/images/our-wedding.jpg`. Keep the images in `assets/images/` and use relative paths. Update the image `alt` text to describe each real photo.

## Add your own music

Put an MP3 that you have permission to use in `assets/music/` and name it `our-song.mp3`. The page already points to `assets/music/our-song.mp3`. If you use another filename or format, update the `<audio>` source in `love.html`. Playback is never started automatically; visitors must press **Play music**.

## Included interactions

- Romantic login with input validation, show/hide password, floating particles and a transition into the celebration page. The login page and its credentials are unchanged.
- Session-only demo access guard on `love.html`.
- Cinematic anniversary intro with a skip control, canvas hearts, petals, date/name reveals and an animated transition.
- Live elapsed-time counter, anniversary timeline, six local gallery placeholders with keyboard-operable lightbox, flip cards and handwritten expandable letter.
- Click-to-open gift surprise with confetti, full-screen heart rain, and a replayable romantic finale with heart-shaped fireworks.
- Continuous canvas hearts, golden sparkles, pointer trails, optional user-started music, responsive layouts, keyboard-visible focus states, and reduced-motion support.

All timeline copy and letter text are intentionally generic; no personal memories have been invented. Edit the text in `love.html` if you want to add your own details.