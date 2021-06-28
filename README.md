# Bluefish

Bluefish is a TypeScript data visualization library. The library is designed to be expressive,
declarative, and extensible. Bluefish can represent not only bar charts, but also tables and trees
all with the same set of compositional primitives. Bluefish is easy to extend with your own
primitives including axes. You can even write a custom axis primitive pretty easily.

Bluefish draws inspiration from many existing data visualization frameworks, but tries to unify them
as simply as possible:
- Observable Plot: many syntax choices and composition ideas
- Visception: nested plots
- GoTree: tree plots
- Charticulator: LP for charts

Bluefish's implementation draws inspiration from the Basalt prototype and from Charticulator. The
use of LP constraints allows for a more declarative specification of things like bars and padding.

Bluefish's design/implementation philosophy is based on several core principles:
- data manipulation should be completely separable from data visualization. that means no transforms
  built into the framework. You can always write a glyph/mark that transforms data internally if you
  want to
- effortless composition. marks and complex glyphs should be virtually indistinguishable so
  everything has the same data type and new data types can be added at any time. composition doesn't
  just mean you can smash two charts side by side, but also that you can recursively compose charts
  together just as easily
- relational properties of data should be visually encodable. when we write down a record, we are
  implicitly specifying that the fields of that record are related to each other. Bluefish allows
  users to visualize these relationships

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `yarn test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `yarn eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
