import FallingSkyGameState from 'fallingsky/state/fallingSkyGameState'
import FactionIDs from 'fallingsky/config/factionIds'
import RegionIDs from 'fallingsky/config/regionIds'
import FactionActions from 'common/factionActions'
import TribeIDs from 'fallingsky/config/tribeIds'

import PlaceWarbands from 'fallingsky/actions/placeWarbands'
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe'
import PlaceFort from 'fallingsky/actions/placeFort'
import PlaceLeader from 'fallingsky/actions/placeLeader'
import PlaceAuxilia from 'fallingsky/actions/placeAuxilia'
import PlaceLegions from 'fallingsky/actions/placeLegions'
import RevealPieces from 'fallingsky/actions/revealPieces'
import ArverniEntreat from 'fallingsky/bots/arverni/arverniEntreat';
import CommandModifier from 'fallingsky/commands/commandModifiers';

describe("Arverni entreat", function () {
    let state;
    let belgae;
    let arverni;
    let aedui;
    let romans;
    let germanic;

    beforeEach(function () {
        state = new FallingSkyGameState();
        belgae = state.belgae;
        arverni = state.arverni;
        aedui = state.aedui;
        romans = state.romans;
        germanic = state.germanic;
    });

    it('replaces aedui, belgic, germanic, preferring city', function () {
        arverni.setResources(20);

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLeader.perform(state, {faction: arverni, region: mandubiiRegion});
        PlaceWarbands.perform(state, {faction: arverni, region: mandubiiRegion, count: 8});
        PlaceAlliedTribe.perform(state, {faction: aedui, region: mandubiiRegion, tribeId: TribeIDs.MANDUBII});
        PlaceAlliedTribe.perform(state, {faction: aedui, region: mandubiiRegion, tribeId: TribeIDs.LINGONES});
        PlaceAlliedTribe.perform(state, {faction: belgae, region: mandubiiRegion, tribeId: TribeIDs.SENONES});

        const atrebatesRegion = state.regionsById[RegionIDs.ATREBATES];
        PlaceWarbands.perform(state, {faction: arverni, region: atrebatesRegion, count: 3});
        PlaceAlliedTribe.perform(state, {faction: belgae, region: atrebatesRegion, tribeId: TribeIDs.ATREBATES});
        PlaceAlliedTribe.perform(state, {faction: germanic, region: atrebatesRegion, tribeId: TribeIDs.BELLOVACI});

        const treveriRegion = state.regionsById[RegionIDs.TREVERI];
        PlaceWarbands.perform(state, {faction: arverni, region: treveriRegion, count: 3});
        PlaceAlliedTribe.perform(state, {faction: germanic, region: treveriRegion, tribeId: TribeIDs.TREVERI});

        const biturigesRegion = state.regionsById[RegionIDs.BITURIGES];
        PlaceWarbands.perform(state, {faction: arverni, region: biturigesRegion, count: 3});
        PlaceAlliedTribe.perform(state, {faction: romans, region: biturigesRegion, tribeId: TribeIDs.BITURIGES});

        expect(ArverniEntreat.entreat(state, new CommandModifier())).to.equal(true);

        let alliedTribe = mandubiiRegion.getAlliesForFaction(FactionIDs.ARVERNI)[0];
        expect(alliedTribe.tribeId).to.equal(TribeIDs.MANDUBII);

        alliedTribe = atrebatesRegion.getAlliesForFaction(FactionIDs.ARVERNI)[0];
        expect(alliedTribe.tribeId).to.equal(TribeIDs.ATREBATES);

        alliedTribe = treveriRegion.getAlliesForFaction(FactionIDs.ARVERNI)[0];
        expect(alliedTribe.tribeId).to.equal(TribeIDs.TREVERI);
        expect(arverni.resources()).to.equal(17);
    });

    it('replaces allies only if control else warbands', function () {
        arverni.setResources(20);

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLeader.perform(state, {faction: arverni, region: mandubiiRegion});
        PlaceWarbands.perform(state, {faction: arverni, region: mandubiiRegion, count: 8});
        PlaceAlliedTribe.perform(state, {faction: aedui, region: mandubiiRegion, tribeId: TribeIDs.MANDUBII});
        PlaceWarbands.perform(state, {faction: aedui, region: mandubiiRegion, count: 3});

        const atrebatesRegion = state.regionsById[RegionIDs.ATREBATES];
        PlaceWarbands.perform(state, {faction: arverni, region: atrebatesRegion, count: 2});
        PlaceAlliedTribe.perform(state, {faction: belgae, region: atrebatesRegion, tribeId: TribeIDs.ATREBATES});
        PlaceWarbands.perform(state, {faction: aedui, region: atrebatesRegion, count: 1});

        expect(ArverniEntreat.entreat(state, new CommandModifier())).to.equal(true);

        let alliedTribe = mandubiiRegion.getAlliesForFaction(FactionIDs.ARVERNI)[0];
        expect(alliedTribe.tribeId).to.equal(TribeIDs.MANDUBII);
        expect(mandubiiRegion.getMobilePiecesForFaction(FactionIDs.AEDUI).length).to.equal(3);

        expect(atrebatesRegion.getAlliesForFaction(FactionIDs.ARVERNI).length).to.equal(0);
        expect(atrebatesRegion.getMobilePiecesForFaction(FactionIDs.AEDUI).length).to.equal(0);
        expect(atrebatesRegion.getMobilePiecesForFaction(FactionIDs.ARVERNI).length).to.equal(3);

        expect(arverni.resources()).to.equal(18);
    });

    it('only replaces aedui warbands and roman auxilia', function () {
        arverni.setResources(20);

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceLeader.perform(state, {faction: arverni, region: mandubiiRegion});
        PlaceWarbands.perform(state, {faction: arverni, region: mandubiiRegion, count: 1});
        PlaceWarbands.perform(state, {faction: aedui, region: mandubiiRegion, count: 1});

        const atrebatesRegion = state.regionsById[RegionIDs.ATREBATES];
        PlaceWarbands.perform(state, {faction: arverni, region: atrebatesRegion, count: 1});
        PlaceAuxilia.perform(state, {faction: romans, region: atrebatesRegion, count: 1});

        const aeduiRegion = state.regionsById[RegionIDs.AEDUI];
        PlaceWarbands.perform(state, {faction: arverni, region: aeduiRegion, count: 1});
        PlaceWarbands.perform(state, {faction: belgae, region: aeduiRegion, count: 1});

        const biturigesRegion = state.regionsById[RegionIDs.BITURIGES];
        PlaceWarbands.perform(state, {faction: arverni, region: biturigesRegion, count: 1});
        PlaceWarbands.perform(state, {faction: germanic, region: biturigesRegion, count: 1});

        expect(ArverniEntreat.entreat(state, new CommandModifier())).to.equal(true);

        expect(mandubiiRegion.getMobilePiecesForFaction(FactionIDs.AEDUI).length).to.equal(0);
        expect(mandubiiRegion.getMobilePiecesForFaction(FactionIDs.ARVERNI).length).to.equal(3);

        expect(atrebatesRegion.getMobilePiecesForFaction(FactionIDs.ROMANS).length).to.equal(0);
        expect(atrebatesRegion.getMobilePiecesForFaction(FactionIDs.ARVERNI).length).to.equal(2);

        expect(aeduiRegion.getMobilePiecesForFaction(FactionIDs.BELGAE).length).to.equal(1);
        expect(aeduiRegion.getMobilePiecesForFaction(FactionIDs.ARVERNI).length).to.equal(1);

        expect(biturigesRegion.getMobilePiecesForFaction(FactionIDs.GERMANIC_TRIBES).length).to.equal(1);
        expect(biturigesRegion.getMobilePiecesForFaction(FactionIDs.ARVERNI).length).to.equal(1);

        expect(arverni.resources()).to.equal(18);
    });
});