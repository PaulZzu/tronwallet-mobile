import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.View`
  background-color: ${props => props.bg};
  border-radius: 4px;
  padding: 8px;
  shadow-offset: 0 5px;
  shadow-radius: 10px;
  shadow-color: #000000;
  shadow-opacity: 0.1;
`

const Text = styled.Text`
  font-size: 13px;
  font-family: Rubik-Medium;
  line-height: 14px;
  color: ${props => props.color};
`

const Badge = ({ bg = '#2E2F47', textColor = '#FFFFFF', children }) => (
  <Wrapper bg={bg}>
    {typeof children === 'string' ? <Text color={textColor}>{children}</Text> : children}
  </Wrapper>
)

export default Badge
