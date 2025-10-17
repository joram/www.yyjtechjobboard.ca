import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  CircularProgress,
  CardActionArea,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchJobData, JobData } from '../utils/csvParser';

const Home: React.FC = () => {
  const [allJobs, setAllJobs] = useState<JobData[]>([]);
  const [displayedJobs, setDisplayedJobs] = useState<JobData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const jobsPerPage = 12; // 4 columns x 3 rows = 12 jobs per load
  const navigate = useNavigate();

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jobData = await fetchJobData();
        // Filter out jobs without proper data and sort by most recent first
        const validJobs = jobData
          .filter(job => job.jobTitle && job.employerName && job.jobLink)
          .sort((a, b) => b.timestamp - a.timestamp); // Most recent first (Unix timestamps)
        
        setAllJobs(validJobs);
        setDisplayedJobs(validJobs.slice(0, jobsPerPage));
        setHasMore(validJobs.length > jobsPerPage);
      } catch (error) {
        console.error('Error loading jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, [jobsPerPage]);

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

  const loadMoreJobs = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      const currentLength = displayedJobs.length;
      const nextBatch = allJobs.slice(currentLength, currentLength + jobsPerPage);
      
      setDisplayedJobs(prev => [...prev, ...nextBatch]);
      setHasMore(currentLength + jobsPerPage < allJobs.length);
      setLoadingMore(false);
    }, 500);
  }, [displayedJobs.length, allJobs, jobsPerPage, loadingMore, hasMore]);

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.offsetHeight - 1000) {
        loadMoreJobs();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMoreJobs]);

  const handleJobClick = (timestamp: number) => {
    navigate(`/job/${timestamp}`);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, backgroundColor: '#fafafa', minHeight: '100vh', mt: 1.25 }}>
      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {displayedJobs.map((job, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} xl={3} key={index}>
              <Card 
                sx={{ 
                  height: 400, // Increased height for 3:4 ratio
                  position: 'relative',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                    transform: 'translateY(-2px)',
                    '& .job-overlay': {
                      opacity: 1,
                    }
                  }
                }}
                onClick={() => handleJobClick(job.timestamp)}
              >
                <CardActionArea sx={{ height: '100%' }}>
                  <CardContent sx={{ height: '100%', display: 'flex', flexDirection: 'column', pb: 3, position: 'relative' }}>
                    <Box flexGrow={1}>
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        gutterBottom
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          minHeight: '3.5em'
                        }}
                      >
                        {job.jobTitle}
                      </Typography>
                      <Typography 
                        variant="h6" 
                        color="primary" 
                        gutterBottom
                        sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {job.employerName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {formatSalary(job)}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" flexWrap="wrap" gap={1} mt={2} mb={1}>
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
                    
                    {/* Posted time in bottom right */}
                    {job.timestamp && (
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{
                          position: 'absolute',
                          bottom: 16,
                          right: 16,
                          fontSize: '0.75rem'
                        }}
                      >
                        {formatDate(job.timestamp)}
                      </Typography>
                    )}
                  </CardContent>
                  
                  {/* Hover Overlay */}
                  <Box
                    className="job-overlay"
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.3), transparent)',
                      color: 'white',
                      p: 3,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: '0 0 8px 8px'
                    }}
                  >
                    <Button 
                      variant="contained" 
                      color="primary"
                      size="large"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/job/${job.timestamp}`);
                      }}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Loading More Indicator */}
      {loadingMore && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}
      
      {/* End of Jobs Message */}
      {!loading && !hasMore && displayedJobs.length > 0 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <Typography variant="body2" color="text.secondary">
            You've reached the end of all available jobs
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default Home;
