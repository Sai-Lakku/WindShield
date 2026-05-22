import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { getUserId } from "../../common/request-context.js";
import { detectRecurringCharges, parseCsvTransactions, summarizeTransactions } from "../../domain/statements/parser.js";
import { aiService } from "../../domain/ai/service.js";
import { statementRepository } from "../../domain/statements/repository.js";
import { enrichCategoriesWithOllama } from "../../domain/statements/categorizer.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});
export const statementsRouter = Router();

const querySchema = z.object({
  userId: z.string().min(1).default("dev-user"),
});
const uploadBodySchema = z.object({
  useLlm: z.coerce.boolean().default(true),
});

// Feature 1.1: Accept PDF/CSV uploads; parse into normalized transaction rows.
statementsRouter.post("/upload", upload.single("statement"), async (req, res) => {
  const userId = getUserId(req);
  const { useLlm } = uploadBodySchema.parse(req.body ?? {});
  if (!req.file) {
    return res.status(400).json({ error: "MissingFile", message: "Attach statement file as form field 'statement'." });
  }

  const fileName = req.file.originalname.toLowerCase();
  const isCsv = fileName.endsWith(".csv");
  const isPdf = fileName.endsWith(".pdf");

  if (!isCsv && !isPdf) {
    return res.status(415).json({
      error: "UnsupportedFileType",
      message: "Only .csv and .pdf statements are accepted.",
    });
  }

  if (isPdf) {
    return res.status(501).json({
      error: "PdfParsingNotImplemented",
      message: "PDF parsing is planned next. Use CSV upload for now.",
    });
  }

  const parsedTransactions = parseCsvTransactions({
    userId,
    fileBuffer: req.file.buffer,
  });
  const transactions = useLlm ? await enrichCategoriesWithOllama(parsedTransactions) : parsedTransactions;
  const recurringCharges = detectRecurringCharges(transactions);
  const summary = summarizeTransactions(transactions, recurringCharges);

  await statementRepository.saveTransactions(userId, transactions);
  await statementRepository.saveRecurring(userId, recurringCharges);
  const aiExtraction = await aiService.extractCardDataFromStatement(
    transactions.slice(0, 4).map((item) => item.description).join(" | "),
  );

  return res.status(201).json({
    message: "Statement parsed successfully",
    fileName: req.file.originalname,
    count: transactions.length,
    llmCategorization: useLlm,
    summary,
    recurringCharges,
    aiExtraction,
  });
});

// Feature 1.1 overlap: Parsed transactions power recurring detection and pay schedule inference.
statementsRouter.get("/transactions", async (req, res) => {
  const { userId } = querySchema.parse({ userId: getUserId(req) });
  const transactions = await statementRepository.getTransactions(userId);
  res.json({ userId, count: transactions.length, transactions });
});

// Feature 1.1: Recurring detection endpoint reused by timeline and proactive warning logic.
statementsRouter.get("/recurring", async (req, res) => {
  const { userId } = querySchema.parse({ userId: getUserId(req) });
  const recurringCharges = await statementRepository.getRecurring(userId);
  res.json({ userId, count: recurringCharges.length, recurringCharges });
});
