# Voiceover transcript

Delivery: conversational and confident at roughly 155 words per minute — about 2:22 of speech, leaving room for a real pause between paragraphs inside a 2:35 cut. Paragraph 1's opening clause ("Here's the whole plate, top to bottom — nothing hidden, nothing cut away.") is the only addition versus the prior draft, added deliberately so the opening full-page scroll (top → bottom → hold → top) reads as an intentional reveal instead of unexplained b-roll; the rest of the hook is unchanged. The paragraphs below are numbered in order and mapped to picture beats by the `VO` column in `demo-script.md`. Nothing above the rule is spoken.

---

Here's the whole plate, top to bottom — nothing hidden, nothing cut away. A plate layout mistake never announces itself. You find it a week later, in the data — after the reagent is gone, and the last aliquot of an irreplaceable sample is sitting in the wrong well.

This is the job. Ninety-six near-identical wells. Controls locked in the corners. Replicates that have to stay apart. Edge wells that evaporate. Tedious, spatial work that people are bad at and agents should be good at.

But not the way agents usually work. A chat assistant can describe a beautiful layout; it can't put one on your plate. An agent driving your screen sees ninety-six identical boxes — coordinates never say which well holds your scarce sample, or whether its plan went stale thirty seconds ago.

So PlateWeave gives the page its own voice. Nine WebMCP tools expose the same versioned state the scientist sees — sample identities, locks, constraints, computed metrics — so the agent reasons about the experiment instead of pixels.

Then I ask for what a scientist actually wants, in one sentence. Keep the controls fixed, samples off the edge, replicates apart, and show me the trade-off. Codex generates two deterministic candidates — one tuned for statistical balance, one for pipetting speed — and asks the page to score its own work. The recommendation lands as a reversible preview, and the whole layout changes at once.

Now the part that matters. This sample is scarce, so I place it at D6 and lock it myself. That edit bumps the state version, making the agent's earlier plan stale — and the page refuses it. Codex rebuilds around my lock and validates. My well never moves.

Export is a harder boundary. The agent can prepare the exact file and its hash, but when it tries to export, the page answers: approval required. That isn't the model's call. I approve the hash myself, and one export goes through — bound to that exact layout, with a receipt. Ask again, and you get the same receipt, never a second file.

That's the shape of trustworthy agent work on the web. The page keeps the rules, the agent does the precision, and the scientist keeps the judgment and the last click. Nobody clicked ninety-six times, and nothing that mattered happened without a person saying yes.
