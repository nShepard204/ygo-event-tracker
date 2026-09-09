import 'dotenv/config';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { AppDataSource } from '../db/data-source.ts';

import { EventType } from '../entities/event.ts';
import { EventService } from '../services/event.ts';
import { HostService } from '../services/host.ts';
import { VenueService } from '../services/venue.ts';
import { LocationController } from '../controllers/location.ts';

async function scrapeInfoFromPage(pageUrl: string) {
  const regionalInfo: object[] = [];

  try {
    const { data } = await axios.get(pageUrl);
    const $ = cheerio.load(data);

    $('table').each((i, table) => {
      const isGenesys = $(table).attr('id')?.includes('gen') ?? false;

      const columns: string[] = [];

      $(table)
        .find('thead th')
        .each((_, el) => {
          columns.push($(el).text().trim());
        });

      $(table)
        .find('tbody tr')
        .each((_, row) => {
          const rowData: { [key: string]: any } = {};

          $(row)
            .find('td')
            .each((j, cell) => {
              const columnName = columns[j] || `column_${j}`;
              const rowText = $(cell).text().trim(); //.replace(/[\r\n]+/gm, " ");

              if (columnName.match(/Venue\s*(?:\/|&)\s*Address/gm)) {
                const rowArray = rowText.split('\n');
                rowData['Venue'] = rowArray[0];
                rowData['Address'] = rowArray
                  .slice(1, rowArray.length)
                  .join(' ');
              } else if (columnName === 'Contact') {
                const rowArray = rowText.split('\n');
                rowData['Email'] = rowArray[0];
                rowData['Phone'] = rowArray[1];
              } else if (columnName === 'Date/Time') {
                const rowArray = rowText.split('\n');
                rowData['Date'] = rowArray[0];
                rowData['Start Time'] = rowArray[1];
              } else if (columnName === 'Venue Seating Capacity') {
                // If this value is 0, the event is a remote duel.
                const playerCap = parseInt(rowText);
                rowData['Player Cap'] = isNaN(playerCap) ? 0 : playerCap;
              } else {
                rowData[columnName] = rowText;
              }
            });

          rowData['Genesys'] = isGenesys;
          regionalInfo.push(rowData);
        });
    });
  } catch (err) {
    console.error(err);
  }

  return regionalInfo;
}

export async function scrapeUsRegionals() {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  const scrapedEvents = await scrapeInfoFromPage(
    'https://www.yugioh-card.com/en/events/regional-locations/'
  );

  // Process Hosts & Venues
  for (const entry of scrapedEvents) {
    const eventData = entry as { [key: string]: any };

    const host = await HostService.upsertScrapedHost({
      name: eventData['Event Host'],
      email: eventData['Email'],
      phoneNumber: eventData['Phone'],
    });

    const venue = await VenueService.upsertScrapedVenue({
      name: eventData['Venue'],
      address: eventData['Address'],
      state: eventData['State / Province'],
      country: eventData['Country'],
      playerCap: eventData['Player Cap'],
      location: await LocationController.getAddressCoordinates(
        eventData['Address']
      ),
    });

    await EventService.upsertScrapedEvent({
      venueId: venue!.id,
      hostId: host!.id,
      date: eventData['Date'],
      startTime: eventData['Start Time'],
      genesys: eventData['Genesys'],
      dragonDuels: eventData['Dragon Duel'],
      eventType: EventType.REGIONAL,
    });
  }
}
