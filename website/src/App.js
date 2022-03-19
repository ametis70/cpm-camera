import React, { useEffect, useState, useCallback } from 'react'
import styled from 'styled-components'
import { AnimatePresence, motion } from 'framer-motion'

const Wrapper = styled(motion.div)`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  text-align: center;
  background: ${({ bg }) => (bg ? `url(${bg})` : 'none')};
  background-size: cover;
  background-position: center;
  bacgrkound-repeat: no-repeat;
`

const App = () => {
  const [serverResponse, setServerResponse] = useState(null)
  console.log(serverResponse)

  const fetchData = useCallback(() => {
    fetch('/processed/random', {
      headers: {
        Accept: 'application/json',
      },
    })
      .then((res) => {
        return res.json()
      })
      .then((data) => {
        setServerResponse({ url: data.url, timestamp: data.timestamp })
      })
      .catch((err) => {
        setServerResponse(null)
        console.log('Error happened during fetching!', err)
      })
      .finally(() => {
        setTimeout(() => fetchData(), 2000)
      })
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <AnimatePresence>
      <Wrapper
        bg={serverResponse?.url}
        key={serverResponse?.url ?? 'loading'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ delay: 1, duration: 2, type: 'tween' }}
      >
        {serverResponse?.url ? null : 'Cargando...'}
      </Wrapper>
    </AnimatePresence>
  )
}

export default App
