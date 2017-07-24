import FallingSkyGameState from 'fallingsky/state/fallingSkyGameState'
import FactionIDs from 'fallingsky/config/factionIds'
import RegionIDs from 'fallingsky/config/regionIds'
import FactionActions from 'common/factionActions'
import TribeIDs from 'fallingsky/config/tribeIds'
import HumanPlayer from 'fallingsky/player/humanPlayer'
import PlaceWarbands from 'fallingsky/actions/placeWarbands'
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe'
import PlaceCitadel from 'fallingsky/actions/placeCitadel'
import PlaceFort from 'fallingsky/actions/placeFort'
import PlaceLeader from 'fallingsky/actions/placeLeader'
import PlaceAuxilia from 'fallingsky/actions/placeAuxilia'
import PlaceLegions from 'fallingsky/actions/placeLegions'
import RevealPieces from 'fallingsky/actions/revealPieces'
import RomanScout from 'fallingsky/bots/romans/romanScout';
import TurnContext from 'common/turnContext';

describe("Roman Battle", function () {
    let state;
    let belgae;
    let arverni;
    let aedui;
    let romans;
    let germanic;
    let turn;

    beforeEach(function () {
        state = new FallingSkyGameState();
        belgae = state.belgae;
        arverni = state.arverni;
        aedui = state.aedui;
        romans = state.romans;
        germanic = state.germanic;
        state.turnHistory.startTurn(romans.id);
        romans.setResources(5);
        turn = state.turnHistory.getCurrentTurn();
    });

    it('scouts', function () {

        const aeduiRegion = state.regionsById[RegionIDs.AEDUI];
        PlaceAlliedTribe.execute(state, {factionId: aedui.id, regionId: aeduiRegion.id, tribeId: TribeIDs.AEDUI});
        PlaceCitadel.execute(state, {factionId: aedui.id, regionId: aeduiRegion.id, tribeId: TribeIDs.AEDUI});
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: aeduiRegion.id, count: 11});


        const arverniRegion = state.regionsById[RegionIDs.ARVERNI];
        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: arverniRegion.id, tribeId: TribeIDs.ARVERNI});
        PlaceCitadel.execute(state, {factionId: arverni.id, regionId: arverniRegion.id, tribeId: TribeIDs.ARVERNI});
        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: arverniRegion.id, tribeId: TribeIDs.CADURCI});
        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: arverniRegion.id, tribeId: TribeIDs.VOLCAE});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: arverniRegion.id, count: 10});

        const atrebatesRegion = state.regionsById[RegionIDs.ATREBATES];
        PlaceFort.execute(state, {factionId: romans.id, regionId: atrebatesRegion.id});
        PlaceAlliedTribe.execute(state, {factionId: belgae.id, regionId: atrebatesRegion.id, tribeId: TribeIDs.ATREBATES});
        PlaceAlliedTribe.execute(state, {factionId: belgae.id, regionId: atrebatesRegion.id, tribeId: TribeIDs.BELLOVACI});
        PlaceAlliedTribe.execute(state, {factionId: romans.id, regionId: atrebatesRegion.id, tribeId: TribeIDs.REMI});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: atrebatesRegion.id, count: 1});
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: atrebatesRegion.id, count: 5});

        const biturigesRegion = state.regionsById[RegionIDs.BITURIGES];
        PlaceAlliedTribe.execute(state, {factionId: aedui.id, regionId: biturigesRegion.id, tribeId: TribeIDs.BITURIGES});
        PlaceCitadel.execute(state, {factionId: aedui.id, regionId: biturigesRegion.id, tribeId: TribeIDs.BITURIGES});
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: biturigesRegion.id, count: 8});

        const britanniaRegion = state.regionsById[RegionIDs.BRITANNIA];
        PlaceAlliedTribe.execute(state, {factionId: romans.id, regionId: britanniaRegion.id, tribeId: TribeIDs.CATUVELLAUNI});

        const carnutesRegion = state.regionsById[RegionIDs.CARNUTES];
        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: carnutesRegion.id, tribeId: TribeIDs.CARNUTES});
        PlaceCitadel.execute(state, {factionId: arverni.id, regionId: carnutesRegion.id, tribeId: TribeIDs.CARNUTES});
        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: carnutesRegion.id, tribeId: TribeIDs.AULERCI});
        PlaceLegions.execute(state, {factionId: romans.id, regionId: carnutesRegion.id, count: 7});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: carnutesRegion.id, count: 6});

        const mandubiiRegion = state.regionsById[RegionIDs.MANDUBII];
        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.MANDUBII});
        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: mandubiiRegion.id, tribeId: TribeIDs.SENONES});
        PlaceWarbands.execute(state, {factionId: aedui.id, regionId: mandubiiRegion.id, count: 1});

        const moriniRegion = state.regionsById[RegionIDs.MORINI];
        PlaceFort.execute(state, {factionId: romans.id, regionId: moriniRegion.id});
        PlaceAlliedTribe.execute(state, {factionId: belgae.id, regionId: moriniRegion.id, tribeId: TribeIDs.MORINI});
        PlaceAlliedTribe.execute(state, {factionId: belgae.id, regionId: moriniRegion.id, tribeId: TribeIDs.MENAPII});
        PlaceLeader.execute(state, {factionId: belgae.id, regionId: moriniRegion.id});
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: moriniRegion.id, count: 14});

        const nerviiRegion = state.regionsById[RegionIDs.NERVII];
        PlaceFort.execute(state, {factionId: romans.id, regionId: nerviiRegion.id});
        PlaceAlliedTribe.execute(state, {factionId: belgae.id, regionId: nerviiRegion.id, tribeId: TribeIDs.NERVII});
        PlaceWarbands.execute(state, {factionId: belgae.id, regionId: nerviiRegion.id, count: 4});
        PlaceWarbands.execute(state, {factionId: germanic.id, regionId: nerviiRegion.id, count: 1});

        const pictonesRegion = state.regionsById[RegionIDs.PICTONES];
        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: pictonesRegion.id, tribeId: TribeIDs.PICTONES});
        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: pictonesRegion.id, tribeId: TribeIDs.SANTONES});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: pictonesRegion.id, count: 5});

        const provinciaRegion = state.regionsById[RegionIDs.PROVINCIA];
        PlaceFort.execute(state, {factionId: romans.id, regionId: provinciaRegion.id});
        PlaceAlliedTribe.execute(state, {factionId: romans.id, regionId: provinciaRegion.id, tribeId: TribeIDs.HELVII});

        const sequaniRegion = state.regionsById[RegionIDs.SEQUANI];
        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: sequaniRegion.id, tribeId: TribeIDs.SEQUANI});
        PlaceCitadel.execute(state, {factionId: arverni.id, regionId: sequaniRegion.id, tribeId: TribeIDs.SEQUANI});
        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: sequaniRegion.id, tribeId: TribeIDs.HELVETII});
        PlaceLeader.execute(state, {factionId: romans.id, regionId: sequaniRegion.id});
        PlaceLegions.execute(state, {factionId: romans.id, regionId: sequaniRegion.id, count: 3});
        PlaceAuxilia.execute(state, {factionId: romans.id, regionId: sequaniRegion.id, count: 2});
        PlaceLeader.execute(state, {factionId: arverni.id, regionId: sequaniRegion.id});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: sequaniRegion.id, count: 18});
        PlaceWarbands.execute(state, {factionId: germanic.id, regionId: sequaniRegion.id, count: 2});

        const sugambriRegion = state.regionsById[RegionIDs.SUGAMBRI];
        PlaceAlliedTribe.execute(state, {factionId: romans.id, regionId: sugambriRegion.id, tribeId: TribeIDs.SUGAMBRI});
        PlaceWarbands.execute(state, {factionId: germanic.id, regionId: sugambriRegion.id, count: 1});

        const treveriRegion = state.regionsById[RegionIDs.TREVERI];
        PlaceFort.execute(state, {factionId: romans.id, regionId: treveriRegion.id});
        PlaceAlliedTribe.execute(state, {factionId: germanic.id, regionId: treveriRegion.id, tribeId: TribeIDs.TREVERI});
        PlaceWarbands.execute(state, {factionId: germanic.id, regionId: treveriRegion.id, count: 1});

        const ubiiRegion = state.regionsById[RegionIDs.UBII];
        PlaceWarbands.execute(state, {factionId: germanic.id, regionId: ubiiRegion.id, count: 1});

        const venetiRegion = state.regionsById[RegionIDs.VENETI];
        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: venetiRegion.id, tribeId: TribeIDs.VENETI});
        PlaceAlliedTribe.execute(state, {factionId: arverni.id, regionId: venetiRegion.id, tribeId: TribeIDs.NAMNETES});
        PlaceWarbands.execute(state, {factionId: arverni.id, regionId: venetiRegion.id, count: 2});

        RomanScout.scout(state, turn.getContext());

    });

});