import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
} from '@mui/material';

const About: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" component="h1" gutterBottom>
          About YYJ Tech Job Board
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Connecting Victoria's tech community
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Our Mission
              </Typography>
              <Typography variant="body1" paragraph>
                The YYJ Tech Job Board was created to serve Victoria's growing tech community.
                We believe that great companies and talented individuals should be able to
                find each other easily, fostering innovation and growth in our local tech scene.
              </Typography>
              <Typography variant="body1">
                Whether you're a startup looking for your first hire or an experienced
                professional seeking your next opportunity, we're here to help make those
                connections happen.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Victoria's Tech Scene
              </Typography>
              <Typography variant="body1" paragraph>
                Victoria is home to a vibrant and growing tech community. From innovative
                startups to established tech companies, the city offers diverse opportunities
                for tech professionals at all levels.
              </Typography>
              <Typography variant="body1">
                Our platform showcases the best of what Victoria has to offer in the tech space,
                helping both job seekers and employers navigate this exciting ecosystem.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2" gutterBottom>
                Get Involved
              </Typography>
              <Typography variant="body1" paragraph>
                We're always looking for ways to better serve the Victoria tech community.
                If you have suggestions, feedback, or would like to get involved in our
                mission, we'd love to hear from you.
              </Typography>
              <Typography variant="body1">
                Together, we can build a stronger, more connected tech community in Victoria.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default About;
