// We only need to import the modules necessary for initial render
import CoreLayout from '../layouts/CoreLayout'
import HomeRoute from './Home'

/*  Note: Instead of using JSX, we recommend using react-router
    PlainRoute objects to build route definitions.   */

export const createRoutes = (store) => ({
  path        : '/',
  component   : CoreLayout,
  indexRoute  : HomeRoute(store),
  childRoutes : []
})

export default createRoutes
