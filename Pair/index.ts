import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import { getTimezonesForCountry } from 'countries-and-timezones';
import { getCode } from 'countrynames';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest, history: Array<any>, entries: Array<any>): Promise<void> {
    // Maximum UTC offset we should tolerate for a match
    // Default to 240 minutes if not sent over query parameter
    const maxOffset = req.query?.maxoffset || 240;
    const freshness = req.query?.freshness || 28;
    let pairTimeDistance = 0;
    let pair: Array<any> | null = [];
    let pairIsFound = false;
    let passes = 0;
    let rollDiceAgain = false;

    while (!pairIsFound && passes < 1024) {
        passes++;
        pair = entries.sort(() => Math.random() - Math.random()).slice(0, 2);

        // Check if pair has been paired before
        const swipeLeft = pair[0]['RowKey'] + pair[1]['RowKey'];
        const swipeRight = pair[1]['RowKey'] + pair[0]['RowKey'];

        // for length of pair array do
        for (let i = 0; i < pair.length; i++) {
            // Table entity has '08/2021' as date, let's rewrite to '2021-08'
            // so Date.parse() can parse it
            const matchedOn = pair[i]['MatchedOn'].split('/').reverse().join('-');
            if (isNaN(Date.parse(matchedOn))) {
                throw(`MatchedOn can't be parsed as Date: Got '${pair[i]['MatchedOn']}' for RowKey '${pair[i]['RowKey']}'`);
            }
            
            const distanceFromTodayInDays = Math.floor((Date.now() - Date.parse(matchedOn)) / (1000 * 60 * 60 * 24));
            if (distanceFromTodayInDays < freshness) {
                context.log(`[DEBUG] Member has been matched in the past ${freshness} days`);
                rollDiceAgain = true;
                break;
            }
        }

        context.log(`[DEBUG] Neither pair member has been matched in the past ${freshness} days`);

        if (rollDiceAgain) {
            pair = null;
            break;
        }

        // Find match in history
        const pairIsFoundInHistory = history.some((item: string) =>
            item['PartitionKey'].toLowerCase() === swipeLeft.toLowerCase() ||
            item['RowKey'].toLowerCase() === swipeRight.toLowerCase());

        context.log('[DEBUG] Pair is found in history:', pairIsFoundInHistory);
        if (pairIsFoundInHistory) {
            pair = null;
        }

        // Deal with ISO notation bullshit for country names
        pair.map(i => (i.Location = i.Location === 'UK' ? 'GB' : i.Location));
        pair.map(i => (i.Location = i.Location === 'USA' ? 'US' : i.Location));

        const locations = [
            getCode(pair[0]['Location'].trim()) || pair[0]['Location'],
            getCode(pair[1]['Location'].trim()) || pair[1]['Location']
        ];

        const timezones = [
            getTimezonesForCountry(locations[0])[0].utcOffset,
            getTimezonesForCountry(locations[1])[0].utcOffset
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
                pair: {},
                debug: {
                    maxOffset: maxOffset,
                    freshness: freshness
                }
            }
        };
    }
    else {
        const finalFlatObject = {
            name1: pair[0]['PartitionKey'],
            email1: pair[0]['RowKey'],
            location1: pair[0]['Location'],
            name2: pair[1]['PartitionKey'],
            email2: pair[1]['RowKey'],
            location2: pair[1]['Location']
        };

        context.res = {
            status: 200,
            body: {
                pair: finalFlatObject,
                debug: {
                    pairTimeDistance: pairTimeDistance,
                    maxOffset: maxOffset,
                    freshness: freshness
                }
            }
        };
    }
};

export default httpTrigger;