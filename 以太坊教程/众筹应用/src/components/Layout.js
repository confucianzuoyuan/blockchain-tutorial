import React from 'react';
import {withStyles} from '@material-ui/core/styles';

import Header from './Header';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        minHeight: '100vh',
    },
    wrapper: {
        margin: '0 auto',
        width: '80%',
        maxWidth: '1200px',
        marginTop: '1em',
    },
};

class Layout extends React.Component {
    render(){
        const {classes} = this.props;
        return (
            <div className={classes.container}>
                <Header></Header>
                <div className={classes.wrapper}>{this.props.children}</div>
            </div>
        );
    }
}

export default withStyles(styles)(Layout);
