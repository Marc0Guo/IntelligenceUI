import { useMemo } from "react";
import { normalizeDocument } from "./contract.js";
import { countWords } from "./useDilStream.js";
import { ClinicalCard, JobsCard, NewsCarousel } from "./productWidgets.jsx";
import {
  CalculatorCard,
  ClockCard,
  CurrencyCard,
  Flashcard,
  Followups,
  LocationCard,
  PieCard,
  QuizCard,
  ScheduleCard,
  StockCard,
  StreamText,
  WeatherCard,
} from "./widgets.jsx";

function Block({ node, onPick }) {
  switch (node.type) {
    case "weather":
      return <WeatherCard node={node} />;
    case "clock":
      return <ClockCard node={node} />;
    case "schedule":
      return <ScheduleCard node={node} />;
    case "location":
      return <LocationCard node={node} />;
    case "stock":
      return <StockCard node={node} />;
    case "currency":
      return <CurrencyCard node={node} />;
    case "pie":
      return <PieCard node={node} />;
    case "quiz":
      return <QuizCard node={node} />;
    case "flashcard":
      return <Flashcard node={node} />;
    case "calculator":
      return <CalculatorCard node={node} />;
    case "followups":
      return <Followups node={node} onPick={onPick} />;
    case "JobsWidget":
      return <JobsCard node={node} />;
    case "NewsArticleWidget":
    case "NewsArticleWidgetCarousel":
      return <NewsCarousel node={node} />;
    case "CalculatorGlasgowComaScaleGcsWidget":
    case "CalculatorGlasgowBlatchfordScoreForUpperGiBleedingWidget":
      return <ClinicalCard node={node} />;
    default:
      return null;
  }
}

export function DilRoot({ doc, blockIndex, words, onPick }) {
  const normalized = useMemo(() => normalizeDocument(doc), [doc]);
  const shownIndex = blockIndex ?? normalized.blocks.length;
  const shownWords = words ?? Number.POSITIVE_INFINITY;
  const payload = JSON.stringify({ metadata: normalized.metadata, blocks: normalized.blocks });
  return (
    <div className="dil-root" data-canonical-dil-root="true" data-d-component="root">
      <script type="application/json" data-canonical-dil-payload="true">
        {payload}
      </script>
      {normalized.blocks.map((block, index) => {
        if (index > shownIndex) return null;
        if (block.type === "text") {
          const limit = index < shownIndex ? countWords(block.text) : shownWords;
          if (limit <= 0) return null;
          return <StreamText key={index} text={block.text} words={limit} />;
        }
        if (block.type === "row") {
          return (
            <div key={index} className="dil-row" data-d-component="row">
              {block.children.map((child, childIndex) => (
                <Block key={childIndex} node={child} onPick={onPick} />
              ))}
            </div>
          );
        }
        return <Block key={index} node={block} onPick={onPick} />;
      })}
    </div>
  );
}
