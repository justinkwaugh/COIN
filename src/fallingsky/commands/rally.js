import _ from '../../lib/lodash';
import Command from './command';
import FactionIDs from '../config/factionIds';
import RegionIDs from '../config/regionIds';
import RegionGroups from '../config/regionGroups';
import RallyRegionResults from './rallyRegionResults';

import PlaceAlliedTribe from '../actions/placeAlliedTribe';
import PlaceCitadel  from '../actions/placeCitadel';
import RemoveResources  from '../actions/removeResources';
import PlaceWarbands  from '../actions/placeWarbands';
import {CapabilityIDs} from '../config/capabilities';


class Rally extends Command {

    static doTest(state, args) {
        const faction = args.faction;
        const regions = args.regions;
        return this.generateResultsForRegions(state, faction, regions || state.regions);
    }

    static doExecute(state, args) {
        console.log('*** ' + args.faction.name + ' Rally *** ');
        const faction = args.faction;
        const regionResults = args.regionResults;

        _.each(
            regionResults, function (regionResult) {
                const factionPieces = regionResult.region.piecesByFaction()[faction.id];

                const isArverni = faction.id === FactionIDs.ARVERNI;
                const isGermanic = faction.id === FactionIDs.GERMANIC_TRIBES;
                const hasVercingetorix = isArverni && _.find(
                        factionPieces, function (piece) {
                            return piece.type === 'leader' && !piece.isSuccessor();
                        });

                let citadelAdded = false;
                let allyAdded = false;
                let warbandsAdded = false;

                const actions = [];

                if (regionResult.addCitadel && faction.availableCitadels().length > 0) {
                    const tribeForCity = regionResult.region.getAlliedCityForFaction(faction.id);
                    actions.push(new PlaceCitadel({factionId: faction.id, regionId: regionResult.region.id, tribeId: tribeForCity.id}));
                    citadelAdded = true;
                }

                if (!citadelAdded && regionResult.addAlly && faction.availableAlliedTribes().length > 0) {
                    const tribeForAlly = _(regionResult.region.subduedTribesForFaction(faction.id)).sortBy(
                        tribe => tribe.isCity ? 'a' : 'b').groupBy(
                        tribe => tribe.isCity ? 'a' : 'b').map(_.shuffle).flatten().first();

                    actions.push(new PlaceAlliedTribe({factionId: faction.id, regionId: regionResult.region.id, tribeId: tribeForAlly.id}));
                    allyAdded = true;
                }

                if ((!citadelAdded && !allyAdded) || hasVercingetorix || isGermanic) {
                    if (regionResult.addNumWarbands > 0 && faction.availableWarbands().length > 0) {
                        actions.push(new PlaceWarbands({
                                factionId: faction.id,
                                regionId: regionResult.region.id,
                                count: Math.min(regionResult.addNumWarbands, faction.availableWarbands().length)
                            }));
                        warbandsAdded = true;
                    }
                }

                if (citadelAdded || allyAdded || warbandsAdded) {
                    RemoveResources.execute(state, { factionId: faction.id, count: regionResult.cost});
                    _.each(actions, action=>action.execute(state));
                }
            });
    }

    static generateResultsForRegions(state, faction, regions) {
        return _(regions).map(
            function (region) {

                const factionPieces = region.piecesByFaction()[faction.id];

                const isArverni = faction.id === FactionIDs.ARVERNI;
                const isBelgae = faction.id === FactionIDs.BELGAE;
                const isGermanic = faction.id === FactionIDs.GERMANIC_TRIBES;

                const hasVercingetorix = isArverni && _.find(
                        factionPieces, function (piece) {
                            return piece.type === 'leader' && !piece.isSuccessor();
                        });

                if (region.devastated() && !hasVercingetorix) {
                    return;
                }

                const isBelgaeOutsideOfBelgica = (isBelgae && region.group !== RegionGroups.BELGICA);
                const cost = isGermanic ? 0 : (region.devastated() || isBelgaeOutsideOfBelgica ? 2 : 1);

                let allyAdded = false;
                let citadelAdded = false;
                let numWarbandsAdded = 0;

                const hasAllyInCity = region.getAlliedCityForFaction(faction.id);
                if (hasAllyInCity && faction.availableCitadels().length > 0) {
                    citadelAdded = true;
                }

                const hasSubduedTribe = region.subduedTribesForFaction(faction.id).length > 0;
                if (hasSubduedTribe && faction.availableAlliedTribes().length > 0 && (region.controllingFactionId() === faction.id || hasVercingetorix)) {
                    allyAdded = true;
                }

                const countedPieces = _.countBy(factionPieces, 'type');
                numWarbandsAdded += (countedPieces.alliedtribe || 0) + (countedPieces.citadel || 0);
                if (isArverni) {
                    if (countedPieces.leader) {
                        numWarbandsAdded += 1;
                    }
                    if (numWarbandsAdded) {
                        numWarbandsAdded += 1;
                    }
                }

                if (numWarbandsAdded === 0 && faction.isHomeRegion(region)) {
                    numWarbandsAdded += 1;
                }

                if (state.hasShadedCapability(CapabilityIDs.AQUITANI, faction.id) &&
                    (region.id === RegionIDs.PICTONES || region.id === RegionIDs.ARVERNI)) {
                    numWarbandsAdded += 2;
                }

                numWarbandsAdded = Math.min(numWarbandsAdded, faction.availableWarbands().length);


                if (allyAdded || citadelAdded || numWarbandsAdded > 0) {
                    return new RallyRegionResults(
                        {
                            region: region,
                            faction: faction,
                            cost: cost,
                            canAddAlly: allyAdded,
                            canAddCitadel: citadelAdded,
                            canAddNumWarbands: numWarbandsAdded
                        });
                }

            }).compact().value();

    }
}

export default Rally;