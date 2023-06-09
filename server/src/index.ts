import axios from 'axios';
import express, { Request, Response } from 'express';

const app = express();
const port = 3001;

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', (req: Request, res: Response) => {
    res.send('This is not the endpoint you\'re looking for...');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


let cachedData: {
    cities?: any[];
    cityData?: { [city: string]: any };
    cityLocations?: { [city: string]: { [address: string]: any } };
} = {};


app.get('/cities', (req: Request, res: Response) => {
    const country = req.query.countryCode;

    // Check if the data is already cached
    if (cachedData.cities) {
        const cities = country ? cachedData.cities.filter((city: any) => city.countryCode === country) : cachedData.cities;
        res.type('json').send(JSON.stringify(cities));
        return; // Return early to avoid making the API request
    }

    axios.get('https://api.struikelstenengids.nl/v2/cities?lang=en')
        .then(result => {
            const cities = result.data.data;

            // Cache the data
            cachedData.cities = cities;

            if (country) {
                const filteredCities = cities.filter((city: any) => city.countryCode === country);
                res.type('json').send(JSON.stringify(filteredCities));
            } else {
                res.type('json').send(JSON.stringify(cities));
            }
        })
        .catch(error => {
            console.error(error);
            res.sendStatus(500);
        });
});

app.get('/cities/:city', (req: Request, res: Response) => {
    const city = req.params.city;
    const lang = req.query.lang && ['en', 'fr', 'nl'].includes(req.query.lang.toString()) ? req.query.lang.toString() : 'nl';

    // Check if the data is already cached
    if (cachedData.cityData && cachedData.cityData[city]) {
        res.type('json').send(JSON.stringify(cachedData.cityData[city]));
        return; // Return early to avoid making the API request
    }

    axios.get(`https://api.struikelstenengids.nl/v2/cities/${city}/?lang=${lang}`)
        .then(result => {
            const cityData = result.data.data;

            // Cache the data
            if (!cachedData.cityData) {
                cachedData.cityData = {};
            }
            cachedData.cityData[city] = cityData;

            res.type('json').send(JSON.stringify(cityData));
        })
        .catch(error => {
            console.error(error);
            res.sendStatus(500);
        });
});

app.get('/cities/:city/locations', (req: Request, res: Response) => {
    const city = req.params.city;
    const lang = req.query.lang && ['en', 'fr', 'nl'].includes(req.query.lang!.toString()) ? req.query.lang?.toString() : 'nl';

    // Check if the data is already cached
    if (cachedData.cityLocations && cachedData.cityLocations[city]) {
        res.type('json').send(JSON.stringify(cachedData.cityLocations[city]));
        return; // Return early to avoid making the API request
    }

    axios.get(`https://api.struikelstenengids.nl/v2/cities/${city}/locations?lang=${lang}`)
        .then(result => {
            const cityLocations = result.data.data;

            // Cache the data
            if (!cachedData.cityLocations) {
                cachedData.cityLocations = {};
            }
            cachedData.cityLocations[city] = cityLocations;

            res.type('json').send(JSON.stringify(cityLocations));
        })
        .catch(error => {
            console.error(error);
            res.sendStatus(500);
        });
});
app.get('/cities/:city/locations/:address', (req: Request, res: Response) => {
    const city = req.params.city;
    const location = req.params.address;
    const lang = req.query.lang && ['en', 'fr', 'nl'].includes(req.query.lang!.toString()) ? req.query.lang?.toString() : 'nl';

    // Check if the data is already cached
    if (cachedData.cityLocations && cachedData.cityLocations[city] && cachedData.cityLocations[city][location]) {
        res.type('json').send(JSON.stringify(cachedData.cityLocations[city][location]));
        return; // Return early to avoid making the API request
    }

    axios.get(`https://api.struikelstenengids.nl/v2/cities/${city}/locations/${location}?lang=${lang}`)
        .then(result => {
            const cityLocation = result.data.data;

            // Cache the data
            if (!cachedData.cityLocations) {
                cachedData.cityLocations = {};
            }
            if (!cachedData.cityLocations[city]) {
                cachedData.cityLocations[city] = {};
            }
            cachedData.cityLocations[city][location] = cityLocation;

            res.type('json').send(JSON.stringify(cityLocation));
        })
        .catch(error => {
            console.error(error);
            res.sendStatus(500);
        });
});


// app.get('/cities', (req: Request, res: Response) => {
//     const country = req.query.countryCode;

//     axios.get('https://api.struikelstenengids.nl/v2/cities?lang=en')
//         .then(result => {
//             const cities = result.data.data;

//             if (country) {
//                 const filteredCities = cities.filter((city: any) => city.countryCode === country);
//                 res.type('json').send(JSON.stringify(filteredCities));
//             } else {
//                 res.type('json').send(JSON.stringify(cities));
//             }
//         })
//         .catch(error => {
//             console.error(error);
//             res.sendStatus(500);
//         });
// });

// app.get('/cities/:city', (req: Request, res: Response) => {
//     const city = req.params.city;
//     const lang = req.query.lang && ['en', 'fr', 'nl'].includes(req.query.lang.toString()) ? req.query.lang.toString() : 'nl'; // en | fr | nl

//     axios.get(`https://api.struikelstenengids.nl/v2/cities/${city}/?lang=${lang}`).then(result => {
//         const cityData = result.data.data;
//         res.type('json').send(JSON.stringify(cityData));
//     }).catch(error => {
//         console.error(error);
//         res.sendStatus(500);
//     });
// });

// app.get('/cities/:city/locations', (req: Request, res: Response) => {
//     const city = req.params.city;
//     const lang = req.query.lang && ['en', 'fr', 'nl'].includes(req.query.lang!.toString()) ? req.query.lang?.toString() : 'nl'; // en | fr | nl

//     axios.get(`https://api.struikelstenengids.nl/v2/cities/${city}/locations?lang=${lang}`).then(result => {
//         const cityLocations = result.data.data;
//         res.type('json').send(JSON.stringify(cityLocations));
//     }).catch(error => {
//         console.error(error);
//         res.sendStatus(500);
//     });
// });

// app.get('/cities/:city/locations/:address', (req: Request, res: Response) => {
//     const city = req.params.city;
//     const location = req.params.address;
//     const lang = req.query.lang && ['en', 'fr', 'nl'].includes(req.query.lang!.toString()) ? req.query.lang?.toString() : 'nl'; // en | fr | nl

//     axios.get(`https://api.struikelstenengids.nl/v2/cities/${city}/locations/${location}?lang=${lang}`).then(result => {
//         const cityLocations = result.data.data;
//         res.type('json').send(JSON.stringify(cityLocations));
//     }).catch(error => {
//         console.error(error);
//         res.sendStatus(500);
//     });
// });