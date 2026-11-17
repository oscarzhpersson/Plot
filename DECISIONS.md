# Decisions

I wanted the board and comments to feel good together. I spent a fair amount of time on the smaller interactions, such as keeping a draft open while zooming and making sure a new pin stays visible when the sidebar opens. Those things affect how comfortable the review workflow feels.

## React Flow

I chose React Flow because it already handles the canvas, connections and resizing, and lets me render custom React components as cards. This gave me a starting point for combining notes, images and interactive 3D models on the same board.

Despite this there was still some work involved in making the interactions fit together. For example, Comment mode needs to disable moving cards and rotating models, whilst still allowing the user to navigate the board. The minimap also needs some custom handling to display comments.

## Cards and comments

The cards share a BoardCard component for their title, subtitle, selection state, resize controls and connectors. Each card type supplies its own content. This keeps their behaviour consistent and makes adding another type fairly straightforward.

Comments have their own state, shared by the canvas and sidebar. Each thread contains its position, status and messages. The pin and the sidebar display the same thread, so replying or resolving updates both.

I store pin positions in board coordinates, using screenToFlowPosition when placing or dragging them. This keeps them in place when panning and zooming. A limitation is that they are attached to the board itself. Moving a card or rotating a model does not move a comment placed over it.

## Saving data

Local storage felt sufficient for this assignment. It lets someone refresh and continue their review without needing an account or a backend. The board layout and comments are saved separately. Card positions are saved once dragging or resizing finishes.

I used Zod to validate the JSON and saved data, and derive the card types from the schemas. It also gives me somewhere to apply defaults for older saves, such as adding the bracket preview image. This keeps those checks out of the card components.

The tradeoff is that the data only exists in that browser. There is no synchronisation between users or devices. Storage errors currently go to the console, so visible feedback for a failed save would be worth adding. However, this was also described in the assignment specification to be ok.

## The 3D viewer

I used React Three Fiber with Three.js to render the models inside the cards. Each model starts with a static preview and loads its interactive viewer when selected. The preview fades out after the first frame is rendered to avoid showing a blank area during loading.

The viewer renders on demand. Orbiting requests another frame, and orbit controls are only active when the card is selected in Pan mode. This helps avoid conflicts between moving the card, moving around the board and inspecting the model.

Once opened, the viewer stays mounted to preserve the camera angle. This uses more GPU resources as more models are opened. For a larger board I would look at limiting how many viewers can stay active. I also increase the selected model's render resolution at higher board zoom to keep it sharp on a Retina display.

## Scope

I focused on reviewing a prepared set of items and completing the comment workflow. The current user is a fixed demo identity, with editing available for that user's messages. A shared version would need authentication, server-side permissions and persistent storage.

With more time, I would improve save failure feedback, test more combinations of browsers and input devices, and look at how the board performs with many more cards and models.
