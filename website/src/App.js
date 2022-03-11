import React from 'react';
import styled from 'styled-components';
import { AnimatePresence, motion } from 'framer-motion';

const Wrapper = styled(motion.div)`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  text-align: center;
  background: url(${props => props.bg });
  background-size: cover;
  background-position: center;
  bacgrkound-repeat: no-repeat;
`;

class App extends React.PureComponent {
  constructor(props){
    super(props);

    this.state = { 
      data: null
    }

    this.getNewImage = this.getNewImage.bind(this);
  }

  getNewImage() {
    fetch('/random')
      .then(res => {
	      return res.json();
      }).then(data => {
	console.log(data);
        this.setState({ data: data.url });
      })
      .catch(err => {
        console.log('Error happened during fetching!', err);
      });
  }

  componentDidMount() {
    this.getNewImage();
  }

  componentDidUpdate(prevProps, prevState) {
    // On state change, fetch and update timeout
    setTimeout(() => { this.getNewImage(); }, 4000);
  }

  render() {
    const { data } = this.state;
    console.log(data);

    return (
      <AnimatePresence>
        <Wrapper 
          bg={data ? data : '' }
          key={data}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 1, duration: 2, type: "tween" }}
        >
          { data ? null : 'Cargando...' }
        </Wrapper>
      </AnimatePresence>
    );
  }
}

export default App;
