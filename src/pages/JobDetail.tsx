import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Breadcrumbs,
  Link,
  Grid,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchJobData, JobData } from '../utils/csvParser';

const JobDetail: React.FC = () => {
  const { timestamp } = useParams<{ timestamp: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<JobData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadJob = async () => {
      try {
        const jobData = await fetchJobData();
        const jobTimestamp = parseInt(timestamp || '0');
        const foundJob = jobData.find(j => j.timestamp === jobTimestamp);
        setJob(foundJob || null);
      } catch (error) {
        console.error('Error loading job:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [timestamp]);

  const formatSalary = (job: JobData) => {
    if (job.salaryRange && job.salaryRange !== '') {
      return job.salaryRange;
    }
    if (job.compLow && job.compHigh) {
      return `$${job.compLow} - $${job.compHigh}`;
    }
    return 'Salary not specified';
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return '';
    try {
      const date = new Date(timestamp * 1000);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Job Not Found
        </Typography>
        <Typography variant="body1" paragraph>
          The job you're looking for doesn't exist or has been removed.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Back to Jobs
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          color="inherit" 
          href="/" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
          sx={{ cursor: 'pointer' }}
        >
          Jobs
        </Link>
        <Typography color="text.primary">{job.jobTitle}</Typography>
      </Breadcrumbs>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h4" component="h1" gutterBottom>
                {job.jobTitle}
              </Typography>
              <Typography variant="h5" color="primary" gutterBottom>
                {job.employerName}
              </Typography>
              
              <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
                {job.workingStyle && (
                  <Chip label={job.workingStyle} />
                )}
                {job.roleType && (
                  <Chip label={job.roleType} />
                )}
                {job.visaSponsorship && job.visaSponsorship !== '' && (
                  <Chip label="Visa Sponsorship" color="secondary" />
                )}
              </Box>

              <Typography variant="h6" gutterBottom>
                Salary: {formatSalary(job)}
              </Typography>

              {job.timestamp && (
                <Typography variant="body1" color="text.secondary" paragraph>
                  Posted: {formatDate(job.timestamp)}
                </Typography>
              )}

              {job.additionalInfo && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom>
                    Job Description
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {job.additionalInfo}
                  </Typography>
                </Box>
              )}

              {job.compensationInfo && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom>
                    Compensation Details
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {job.compensationInfo}
                  </Typography>
                </Box>
              )}

              {job.hiringProcess && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom>
                    Hiring Process
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {job.hiringProcess}
                  </Typography>
                </Box>
              )}

              {job.contactSlack && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom>
                    Contact Information
                  </Typography>
                  <Typography variant="body1" paragraph>
                    Slack: {job.contactSlack}
                  </Typography>
                </Box>
              )}

              <Box mt={4}>
                <Button 
                  variant="contained" 
                  size="large"
                  href={job.jobLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ mr: 2 }}
                >
                  Apply Now
                </Button>
                <Button 
                  variant="outlined" 
                  size="large"
                  onClick={() => navigate('/')}
                >
                  Back to Jobs
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Job Details
              </Typography>
              
              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Company
                </Typography>
                <Typography variant="body1">
                  {job.employerName}
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Location
                </Typography>
                <Typography variant="body1">
                  Victoria, BC
                </Typography>
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Salary Range
                </Typography>
                <Typography variant="body1">
                  {formatSalary(job)}
                </Typography>
              </Box>

              {job.workingStyle && (
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Working Style
                  </Typography>
                  <Typography variant="body1">
                    {job.workingStyle}
                  </Typography>
                </Box>
              )}

              {job.roleType && (
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">
                    Role Type
                  </Typography>
                  <Typography variant="body1">
                    {job.roleType}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default JobDetail;
