interface AppProps {
  instance: any,
  isEdited: boolean,
  onStateChange: () => void
}

type PrepareFunction = (
  initialState: any,
  additionalArgs?: any,
) => PrepareResult

interface PrepareResult {
  instance: any,
  getState: (instance: any) => any,
}

declare function prepare(initialState: any, additionalArgs: {[key: string]: any}): PrepareResult
declare function AppComponent(props: AppProps): JSX.Element
declare function configure(backendUrl: string): {prepare: PrepareFunction, AppComponent: (props: AppProps) => JSX.Element}
export default configure