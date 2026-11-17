# Plot

A canvas for reviewing mechanical designs, built for Encube’s frontend take-home.

## Run locally

Use Node.js 24 and pnpm.

```sh
pnpm install
pnpm dev
```

Open the local URL printed by Vite. Run `pnpm build` to create a production build and `pnpm preview` to serve it locally.

## Try it

- Drag the background or scroll to pan. Pinch or use the toolbar to zoom. Drag the minimap to move around the board.
- Select a card to see its resize and connection handles. Select **Gear assembly** and drag inside the preview to rotate the model.
- Pick **Comment** in the toolbar and click the board to start a thread. Hover over a pin for a preview, or click it to reply or resolve the thread. Use the **Resolved** tab to reopen it.

## Canvas and storage

React Flow handles the viewport and card connections. The 3D cards use React Three Fiber and load their models on first selection, so opening the board doesn’t start every viewer.

The board layout, connections, and comments are saved in the current browser. Open a private window or clear browser cache to see the starter board again.

## Deployed

The application is deployed [here](plot-canvas.vercel.app)!

Demo video can be found [here](https://drive.google.com/file/d/1W61Iz0RgYh9uaBiV0hxfVK6gCG5mlT6g/view?usp=sharing)!

Feel free to test it out.
