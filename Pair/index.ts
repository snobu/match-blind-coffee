import { AzureFunction, BindingDefinition, Context, HttpRequest } from '@azure/functions';
import { getTimezonesForCountry } from 'countries-and-timezones';
import { getCode } from 'countrynames';

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest, history: Array<any>, entries: Array<any>): Promise<void> {
    // Maximum UTC offset we should tolerate for a match
    // Default to 240 minutes if not sent over query parameter
    let maxOffset = req.query?.maxoffset || 240;
    let pairUtcOffset: number = 0;
    let pair: Array<any> = [];
    let pairIsFound = false;
    let pairIsFoundInHistory = false;
    let passes = 0;

    while (!pairIsFound && passes < 1024) {
        passes++;
        pair = entries.sort(() => Math.random() - Math.random()).slice(0, 2);

        // Check if pair has been paired before
        let swipeLeft = pair[0]['RowKey'] + pair[1]['RowKey'];
        let swipeRight = pair[1]['RowKey'] + pair[0]['RowKey'];

        // Find match in history
        let pairIsFoundInHistory = history.some((item: string) =>
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

        const location0 = getCode(pair[0]['Location'].trim()) || pair[0]['Location'];
        const location1 = getCode(pair[1]['Location'].trim()) || pair[1]['Location'];

        context.log(pair[0]['Location'], location0);
        context.log(pair[1]['Location'], location1);

        let tz0 = getTimezonesForCountry(location0)[0].utcOffset;
        let tz1 = getTimezonesForCountry(location1)[0].utcOffset;

        pairUtcOffset = Math.abs(tz1 - tz0);
        if (pairUtcOffset <= maxOffset) {
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
                    pairUtcOffset: pairUtcOffset,
                    maxOffset: maxOffset
                }
            }
        };
    }
};

export default httpTrigger;