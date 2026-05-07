import { createContext, useContext, useReducer } from 'react'

const WizardContext = createContext(null)

const initialState = {
  detectedStack: null,
  currentStep: 1,
  confirmedProfile: null,
  selectedChecks: [],
  generatedYaml: null,
  templateUsed: null,
  repoUrl: '',
}

function wizardReducer(state, action) {
  switch (action.type) {
    case 'SET_DETECTED_STACK':
      return {
        ...state,
        detectedStack: action.payload,
        currentStep: 2,
      }
    case 'SET_REPO_URL':
      return {
        ...state,
        repoUrl: action.payload,
      }
    case 'CONFIRM_PROFILE':
      return {
        ...state,
        confirmedProfile: action.payload,
        currentStep: 3,
      }
    case 'SET_CHECKS':
      return {
        ...state,
        selectedChecks: action.payload,
      }
    case 'SET_GENERATED_YAML':
      return {
        ...state,
        generatedYaml: action.payload.yaml,
        templateUsed: action.payload.template_used,
        currentStep: 4,
      }
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
      }
    case 'RESET':
      return initialState
    default:
      return state
  }
}

export function WizardProvider({ children }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState)

  return (
    <WizardContext.Provider value={{ state, dispatch }}>
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard() {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error('useWizard must be used within a WizardProvider')
  }
  return context
}

export default WizardContext
