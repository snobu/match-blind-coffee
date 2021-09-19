import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { getTimezonesForCountry } from 'countries-and-timezones';
import { getCode } from 'countrynames';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest, history: Array<any>, entries: Array<any>): Promise<void> {
    // Maximum UTC offset we should tolerate for a match
    // Default to 240 minutes if not sent over query parameter
    const maxOffset = req.query?.maxoffset || 240;
    let pairTimeDistance = 0;
    let pair: Array<any> = [];
    let pairIsFound = false;
    let passes = 0;

    while (!pairIsFound && passes < 1024) {
        passes++;
        pair = entries.sort(() => Math.random() - Math.random()).slice(0, 2);

        // Check if pair has been paired before
        const swipeLeft = pair[0]['RowKey'] + pair[1]['RowKey'];
        const swipeRight = pair[1]['RowKey'] + pair[0]['RowKey'];

        // Find match in history
        const pairIsFoundInHistory = history.some((item: string) =>
            item['PartitionKey'].toLowerCase() === swipeLeft.toLowerCase() ||
            item['RowKey'].toLowerCase() === swipeRight.toLowerCase());

        context.log('Pair is found in history: ', pairIsFoundInHistory);
        if (pairIsFoundInHistory) {
            pair = null;
            break;
        }

        // Deal with ISO notation bullshit for country names
        pair.map(i => (i.Location = i.Location === 'UK' ? 'GB' : i.Location));
        pair.map(i => (i.Location = i.Location === 'USA' ? 'US' : i.Location));

        const locations =  [
            getCode(pair[0]['Location'].trim()) || pair[0]['Location'],
            getCode(pair[1]['Location'].trim()) || pair[1]['Location']
        ];

        const timezones = [
            getTimezonesForCountry(locations[0])[0].utcOffset,
            getTimezonesForCountry(locations[0])[0].utcOffset
        ];

        pairTimeDistance = Math.abs(timezones[1] - timezones[0]);
        if (pairTimeDistance <= maxOffset) {
            pairIsFound = true;
        }
    }

    if (pair == null) {
        context.res = {
            status: 200,
            body: {
                pair: [],
                debug: {
                    maxOffset: maxOffset
                }
            }
        }
    }
    else {
        let finalPair = pair.map(item => {
            return {
                name: item['PartitionKey'],
                email: item['RowKey'],
                location: item['Location']
            }
        });

        context.res = {
            status: 200,
            body: {
                pair: finalPair,
                debug: {
                    pairTimeDistance: pairTimeDistance,
                    maxOffset: maxOffset
                }
            }
        };
    }
};

export default httpTrigger;