import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Pagination,
} from '@mui/material';
import { fetchJobData, JobData } from '../utils/csvParser';

const Jobs: React.FC = () => {
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 10;

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jobData = await fetchJobData();
        // Filter out jobs without proper data and sort by most recent first
        const validJobs = jobData
          .filter(job => job.jobTitle && job.employerName && job.jobLink)
          .sort((a, b) => b.timestamp - a.timestamp); // Most recent first (Unix timestamps)
        setJobs(validJobs);
      } catch (error) {
        console.error('Error loading jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

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
      const date = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(jobs.length / jobsPerPage);
  const startIndex = (currentPage - 1) * jobsPerPage;
  const endIndex = startIndex + jobsPerPage;
  const currentJobs = jobs.slice(startIndex, endIndex);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Tech Jobs in Victoria
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Discover opportunities in Victoria's thriving tech scene
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {currentJobs.map((job, index) => (
            <Grid item xs={12} key={index}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Box>
                      <Typography variant="h5" component="h2" gutterBottom>
                        {job.jobTitle}
                      </Typography>
                      <Typography variant="h6" color="primary" gutterBottom>
                        {job.employerName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Victoria, BC • {formatSalary(job)}
                      </Typography>
                      {job.timestamp && (
                        <Typography variant="body2" color="text.secondary">
                          Posted at: {formatDate(job.timestamp)}
                        </Typography>
                      )}
                    </Box>
                    <Button 
                      variant="contained" 
                      color="primary"
                      href={job.jobLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Apply Now
                    </Button>
                  </Box>
                  {job.additionalInfo && (
                    <Typography variant="body1" paragraph>
                      {job.additionalInfo}
                    </Typography>
                  )}
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {job.workingStyle && (
                      <Chip label={job.workingStyle} size="small" />
                    )}
                    {job.roleType && (
                      <Chip label={job.roleType} size="small" />
                    )}
                    {job.visaSponsorship && job.visaSponsorship !== '' && (
                      <Chip label="Visa Sponsorship" size="small" color="secondary" />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}
    </Container>
  );
};

export default Jobs;
