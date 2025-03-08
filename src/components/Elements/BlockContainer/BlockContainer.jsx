import React from 'react'
import s from './BlockContainer.module.css'

export const BlockContainer = ({children}) => {
  return (
    <div className={s.container}>{children}</div>
  )
}
