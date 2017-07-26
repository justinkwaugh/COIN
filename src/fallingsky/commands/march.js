import _ from '../../lib/lodash';
import Command from './command';
import FactionIDs from '../config/factionIds';
import {CapabilityIDs} from 'fallingsky/config/capabilities';
import RegionIDs from '../config/regionIds';
import RegionGroups from '../config/regionGroups';
import MarchResults from './marchResults';
import Map from '../util/map';

class March extends Command {
    static doTest(state, args) {
        const faction = args.faction;
        return this.generateResultsForRegions(state, faction, state.regions);
    }

    static generateResultsForRegions(state, faction, regions) {
        return _(regions).map(
            (region) => {
                const isAedui = faction.id === FactionIDs.AEDUI;
                const isArverni = faction.id === FactionIDs.ARVERNI;
                const isRomans = faction.id === FactionIDs.ROMANS;
                const isGermanic = faction.id === FactionIDs.GERMANIC_TRIBES;

                const mobileFactionPieces = _.filter(region.piecesByFaction()[faction.id], {isMobile: true});

                if (mobileFactionPieces.length === 0 || (state.frost() && !isGermanic)) {
                    return;
                }

                const firstRegions = _(region.adjacent).filter(destination => destination.inPlay()).value();
                let secondRegions = [];
                let thirdRegions = [];

                const hasVercingetorix = isArverni && _.find(
                        mobileFactionPieces, function (piece) {
                            return piece.type === 'leader' && !piece.isSuccessor();
                        });
                const hasCaesar = isRomans && _.find(
                        mobileFactionPieces, function (piece) {
                            return piece.type === 'leader' && !piece.isSuccessor();
                        });

                if (hasVercingetorix || isRomans) {
                    secondRegions = _(firstRegions).map(
                        adjacentRegion => adjacentRegion.adjacent).flatten().uniq().value();
                }

                if (hasCaesar) {
                    thirdRegions = _(secondRegions).map(
                        adjacentRegion => adjacentRegion.adjacent).flatten().uniq().value();
                }

                let destinations = _.concat(firstRegions, secondRegions, thirdRegions);
                destinations = _(destinations).reject(destination => destination.id === region.id).filter(
                    destination => destination.inPlay()).uniq().value();

                const marchLimit = hasCaesar ? 3 : isRomans || hasVercingetorix ? 2 : 1;
                destinations = _(destinations).filter((destination) => {
                    const paths = _(Map.findPathsToRegion(state, region.id, destination.id, marchLimit)).reject(
                        (path) => {
                            return this.isInvalidMarchPath(state, path);
                        }).value();
                    return paths.length > 0;
                }).value();

                let cost = region.devastated() ? 2 : 1;
                if (isRomans) {
                    cost *= 2;
                }

                if (isGermanic) {
                    cost = 0;
                }

                if (isAedui && state.hasShadedCapability(CapabilityIDs.CONVICTOLITAVIS)) {
                    cost *= 2;
                }

                return new MarchResults(
                    {
                        region: region,
                        faction: faction,
                        mobilePieces: mobileFactionPieces,
                        adjacentDestinations: firstRegions,
                        destinations: destinations,
                        cost: cost
                    });
            }).compact().value();
    }

    static isInvalidMarchPath(state, path) {
        if (path.length < 3) {
            return false;
        }

        // Britannia
        let subPath = path.slice(0, path.length - 1);
        if (_.indexOf(subPath, RegionIDs.BRITANNIA) >= 0) {
            return true;
        }

        // Devastated
        subPath = path.slice(1, path.length - 1);
        if (_.find(subPath, id => state.regionsById[id].devastated())) {
            return true;
        }

        // Rhenus
        if (_.find(_.range(1, path.length - 1), (index) => {
                const from = path[index - 1];
                const to = path[index];
                return this.crossesRhenus(state, from, to);

            })) {
            return true;
        }
    }

    static crossesRhenus(state, fromId, toId) {
        const fromRegion = state.regionsById[fromId];
        const toRegion = state.regionsById[toId];

        return (fromRegion.group === RegionGroups.GERMANIA || toRegion.group === RegionGroups.GERMANIA) &&
               !(fromRegion.group === RegionGroups.GERMANIA && toRegion.group === RegionGroups.GERMANIA);
    }

}

export default March;