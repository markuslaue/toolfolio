# Toolfolio - Production-Image (Next.js standalone)
# Multi-Stage: deps -> build -> schlanker Runner.

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* werden beim Build inlined, daher als Build-Args reinreichen.
# (publishable key ist oeffentlich, darf ins Image. Secret key NUR zur Laufzeit.)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL \
    NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_TELEMETRY_DISABLED=1
# KEIN NODE_OPTIONS-Speicherdeckel mehr.
# Frueher stand hier --max-old-space-size=1536, um den 4-GB-Produktionsserver beim
# Bauen zu schonen. Seit der Build bei GitHub Actions laeuft (16 GB Runner), ist der
# Deckel nicht nur ueberfluessig, er ist SCHAEDLICH: 1,5 GB reichen fuer diesen Build
# nicht, und er stirbt mit "JavaScript heap out of memory". Genau daran ist der erste
# GitHub-Build gescheitert. GitHub hat Speicher genug, also lassen wir Node atmen.
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
