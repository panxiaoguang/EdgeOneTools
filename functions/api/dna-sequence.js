/**
 * EdgeOne Pages Function for fetching DNA sequences from UCSC Genome API
 * Replicates the Python get_genome_seq function functionality
 */

export async function onRequestGet(context) {
  try {
    const url = new URL(context.request.url);
    const params = url.searchParams;
    
    // Extract query parameters
    const genome = params.get('genome');
    const chrom = params.get('chrom');
    const start = params.get('start');
    const end = params.get('end');
    const reverse = params.get('reverse') || 'false';
    
    // Validate required parameters
    if (!genome || !chrom || !start || !end) {
      return new Response(JSON.stringify({
        error: 'Missing required parameters. Required: genome, chrom, start, end'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Validate numeric parameters
    const startNum = parseInt(start);
    const endNum = parseInt(end);
    
    if (isNaN(startNum) || isNaN(endNum)) {
      return new Response(JSON.stringify({
        error: 'start and end must be valid numbers'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    if (startNum >= endNum) {
      return new Response(JSON.stringify({
        error: 'start must be less than end'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Build UCSC API URL
    const ucscApiUrl = new URL('https://api.genome.ucsc.edu/getData/sequence');
    ucscApiUrl.searchParams.set('genome', genome);
    ucscApiUrl.searchParams.set('chrom', chrom);
    ucscApiUrl.searchParams.set('start', startNum.toString());
    ucscApiUrl.searchParams.set('end', endNum.toString());
    ucscApiUrl.searchParams.set('revComp', reverse === 'true' ? 'true' : 'false');
    
    // Fetch data from UCSC API
    const response = await fetch(ucscApiUrl.toString());
    
    if (!response.ok) {
      return new Response(JSON.stringify({
        error: `UCSC API error: ${response.status} ${response.statusText}`
      }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    const data = await response.json();
    
    // Return the response from UCSC API
    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

export function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}