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
    NEXT_TELEMETRY_DISABLED=1 \
    # DECKEL FUER DEN BUILD-SPEICHER.
    #
    # Der Build laeuft AUF dem Produktionsserver. Ohne Deckel nimmt sich Node so viel
    # Arbeitsspeicher, wie es kriegen kann, der Kernel toetet daraufhin den LAUFENDEN
    # Webcontainer, um Platz zu machen, und die Seite ist waehrend des Builds weg.
    # Genau das ist zweimal passiert.
    #
    # 1,5 GB reichen fuer diesen Build und lassen dem laufenden Container Luft.
    NODE_OPTIONS=--max-old-space-size=1536
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
