import React from 'react'

const DEFAULT_VALUE = {}

export const withContext = Component => Component

export const Context = React.createContext(DEFAULT_VALUE)
