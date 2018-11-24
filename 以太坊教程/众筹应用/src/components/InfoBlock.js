import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import {withStyles} from '@material-ui/core/styles';

const styles = {
    container: {
        padding: '0.5em 1em',
        border: '1px dotted #AAA'
    },
    title: {
        color: '#333',
        marginBottom: '10px',
        fontWeight: 'bold'
    },
    description: {
        margin: 0,
        color: '#666'
    }        
};

class InfoBlock extends React.Component {
    render(){
        const { classes, title, description } = this.props;
        return (
            <Grid item md={4}>
                <div className={classes.container}>
                    <Typography variant="title" color="inherit" className={classes.title}>
                        {title}
                    </Typography>
                    <Typography variant="paragraph" color="inherit" className={classes.description}>
                        {description}
                    </Typography>
                </div>
            </Grid>
        );
    }
}

export default withStyles(styles)(InfoBlock);