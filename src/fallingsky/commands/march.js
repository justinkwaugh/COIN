import _ from '../../lib/lodash';
import Command from './command';
import FactionIDs from '../config/factionIds';
import MarchResults from './marchResults';

class March extends Command {
    static doTest(state, args) {
        const faction = args.faction;
        return this.generateResultsForRegions(state, faction, state.regions);
    }

    static generateResultsForRegions(state, faction, regions) {
        return _(regions).map(
            function (region) {
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

                if (hasVercingetorix || (isRomans && !hasCaesar)) {
                    secondRegions = _(firstRegions).map(adjacentRegion => adjacentRegion.adjacent).flatten().uniq().value();
                }

                if (hasCaesar) {
                    thirdRegions = _(secondRegions).map(adjacentRegion => adjacentRegion.adjacent).flatten().uniq().value();
                }

                let destinations = _.concat(firstRegions, secondRegions, thirdRegions);
                destinations = _(destinations).reject(destination=>destination.id === region.id).filter(destination => destination.inPlay()).uniq().value();

                // Need to handle rhenus / devastated / britannia
                // (probably just need to find full set of paths from origin to each destination and then disqualify)

                let cost = region.devastated() ? 2 : 1;
                if (isRomans) {
                    cost *= 2;
                }

                if (isGermanic) {
                    cost = 0;
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
}

export default March;